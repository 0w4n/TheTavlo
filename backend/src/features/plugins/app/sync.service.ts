import type { Firestore } from "firebase-admin/firestore";
import { z } from "zod";
import { pluginIdSchema, pluginManifestSchema, registrySchema, semverSchema } from "../domain/manifest.schema.js";
import { compareSemver } from "../domain/plugin.rules.js";
import { dispatchPluginBuild } from "../infrastructure/buildDispatcher.js";
import { listSemverTags, readFile } from "../infrastructure/github.client.js";
import { PluginStore } from "../infrastructure/pluginStore.firestore.js";

const MAX_BUNDLE_BYTES = 1024 * 1024;
const BUILD_TIMEOUT_MS = 60 * 60 * 1000;

/**
 * Descubrimiento + sincronización. Idempotente: se puede llamar desde
 * `marketplace.sync` (admin), Cloud Scheduler o el job de deploy.
 *
 *  registry.json (allowlist por PR) → tags semver → manifiesto @SHA → validar
 *  → release `pending` → dispatch a GitHub Actions → `building`
 */
export async function syncCatalog(db: Firestore) {
  const store = new PluginStore(db);
  const registry = registrySchema.parse(
    JSON.parse(await readFile(process.env.PLUGIN_REGISTRY_REPO ?? "thetavlo/plugin-registry", "registry.json")),
  );
  const report = { plugins: registry.length, queued: 0, rejected: 0, revoked: 0, errors: 0 };

  for (const entry of registry) {
    try {
      await store.upsertCatalog(entry);
      for (const tag of await listSemverTags(entry.repo)) {
        const existing = await store.getRelease(entry.id, tag.version);

        if (existing) {
          if (existing.commitSha !== tag.sha && existing.status !== "revoked") {
            // Tag movido tras publicarse → posible ataque de supply-chain. Kill-switch.
            await store.patchRelease(entry.id, tag.version, { status: "revoked", reason: "El tag apunta a otro commit" });
            report.revoked++;
          } else if (existing.status === "pending") {
            await dispatchPluginBuild({ pluginId: entry.id, version: tag.version, repo: entry.repo, sha: tag.sha });
            await store.patchRelease(entry.id, tag.version, { status: "building" });
          } else if (existing.status === "building" && Date.now() - Date.parse(existing.updatedAt) > BUILD_TIMEOUT_MS) {
            await store.patchRelease(entry.id, tag.version, { status: "rejected", reason: "Timeout de build" });
          }
          continue;
        }

        const verdict = await validateManifest(entry.repo, entry.id, tag);
        if (!verdict.ok) {
          await store.createRelease({
            pluginId: entry.id, version: tag.version, commitSha: tag.sha,
            status: "rejected", manifest: null, reason: verdict.reason,
          });
          report.rejected++;
          continue;
        }
        await store.createRelease({
          pluginId: entry.id, version: tag.version, commitSha: tag.sha, status: "pending", manifest: verdict.manifest,
        });
        try {
          await dispatchPluginBuild({ pluginId: entry.id, version: tag.version, repo: entry.repo, sha: tag.sha });
          await store.patchRelease(entry.id, tag.version, { status: "building" });
          report.queued++;
        } catch { /* queda `pending`; el siguiente sync reintenta */ }
      }
    } catch (error) {
      report.errors++;
      console.error(`[plugins.sync] ${entry.id}`, error);
    }
  }
  await store.unlistExcept(new Set(registry.map((r) => r.id)));
  return report;
}

async function validateManifest(repo: string, id: string, tag: { version: string; sha: string }) {
  try {
    const parsed = pluginManifestSchema.safeParse(JSON.parse(await readFile(repo, "thetavlo.plugin.json", tag.sha)));
    if (!parsed.success) return { ok: false as const, reason: `Manifiesto inválido: ${parsed.error.issues[0]?.message}` };
    if (parsed.data.id !== id) return { ok: false as const, reason: "manifest.id no coincide con el registry" };
    if (parsed.data.version !== tag.version) return { ok: false as const, reason: "manifest.version no coincide con el tag" };
    return { ok: true as const, manifest: parsed.data };
  } catch (e) {
    return { ok: false as const, reason: `No se pudo leer el manifiesto: ${(e as Error).message}`.slice(0, 300) };
  }
}

// ── Callback del workflow de CI (ver ciCallback.express.ts) ────────────────
const reportSchema = z.object({
  pluginId: pluginIdSchema,
  version: semverSchema,
  sha: z.string().regex(/^[0-9a-f]{40}$/),
  ok: z.boolean(),
  integrity: z.string().regex(/^sha256-[A-Za-z0-9+/]{43}=$/).optional(),
  bundleUrl: z.string().url().optional(),
  sizeBytes: z.number().int().positive().max(MAX_BUNDLE_BYTES).optional(),
  error: z.string().max(500).optional(),
}).strict();

export async function reportBuild(db: Firestore, raw: unknown) {
  const r = reportSchema.parse(raw);
  const store = new PluginStore(db);
  const release = await store.getRelease(r.pluginId, r.version);
  if (!release || release.commitSha !== r.sha || release.status !== "building") throw new Error("release_mismatch");

  const expectedUrl = `${process.env.PLUGINS_PUBLIC_URL}/${r.pluginId}/${r.version}/index.html`;
  if (!r.ok || !r.integrity || !r.sizeBytes || r.bundleUrl !== expectedUrl) {
    await store.patchRelease(r.pluginId, r.version, { status: "rejected", reason: r.error ?? "Build inválido" });
    return;
  }
  await store.patchRelease(r.pluginId, r.version, {
    status: "approved", bundleUrl: r.bundleUrl, integrity: r.integrity, sizeBytes: r.sizeBytes,
  });
  const entry = await store.getCatalog(r.pluginId);
  if (!entry?.latestVersion || compareSemver(r.version, entry.latestVersion) > 0) {
    await store.setLatest(r.pluginId, r.version);
  }
}
