import { createHash } from "node:crypto";
import type { Firestore } from "firebase-admin/firestore";
import {
  parsePluginId, parsePluginManifest, parseRegistry, parseSemver, type PluginManifest,
} from "../domain/manifest.validator.js";
import { buildBundleUrls, compareSemver } from "../domain/plugin.rules.js";
import { FileTooLargeError, GitHubHttpError, listSemverTags, readFile, readFileBytes } from "../infrastructure/github.client.js";
import { PluginStore } from "../infrastructure/pluginStore.firestore.js";

const MAX_BUNDLE_BYTES = 1024 * 1024;
const BUNDLE_FILE = "dist/index.html";
const HTML_START = /^\s*(?:<!--[\s\S]*?-->\s*)*<(?:!doctype\s+html|html|head|body|meta|script|style|title|div|main)\b/i;

type Verdict =
  | { ok: true; manifest: PluginManifest; integrity: string; sizeBytes: number; bundleUrls: string[] }
  | { ok: false; reason: string };

/**
 * Descubrimiento + sincronización. Idempotente: se puede llamar desde
 * `marketplace.sync` (admin), Cloud Scheduler o el job de deploy.
 *
 *  registry.json (allowlist por PR) → tags semver → SHA → manifiesto @SHA
 *  → dist/index.html @SHA (bytes) → sha256 → release `approved` inmutable.
 *
 * Nada se copia a infraestructura propia: el cliente descarga de GitHub/jsDelivr y verifica el hash.
 * Veredictos permanentes (contenido inválido en ese SHA) → `rejected`; fallos transitorios
 * (red, 5xx, rate-limit) NO crean release y se reintentan en el siguiente sync.
 */
export async function syncCatalog(db: Firestore) {
  const store = new PluginStore(db);
  const registry = parseRegistry(
    JSON.parse(await readFile(process.env.PLUGIN_REGISTRY_REPO ?? "thetavlo/plugin-registry", "registry.json")),
  );
  const report = { plugins: registry.length, approved: 0, rejected: 0, revoked: 0, errors: 0 };

  for (const entry of registry) {
    try {
      await store.upsertCatalog(entry);
      let latest = (await store.getCatalog(entry.id))?.latestVersion ?? null;

      for (const tag of await listSemverTags(entry.repo)) {
        try {
          const existing = await store.getRelease(entry.id, tag.version);
          if (existing) {
            if (existing.commitSha !== tag.sha && existing.status !== "revoked") {
              // Tag movido tras publicarse → posible ataque de supply-chain. Kill-switch.
              await store.patchRelease(entry.id, tag.version, { status: "revoked", reason: "El tag apunta a otro commit" });
              report.revoked++;
            }
            continue;
          }

          const verdict = await inspectRelease(entry.repo, entry.id, tag);
          if (!verdict.ok) {
            await store.createRelease({
              pluginId: entry.id, version: tag.version, commitSha: tag.sha,
              status: "rejected", manifest: null, reason: verdict.reason,
            });
            report.rejected++;
            continue;
          }
          await store.createRelease({
            pluginId: entry.id, version: tag.version, commitSha: tag.sha, status: "approved",
            manifest: verdict.manifest, bundleUrls: verdict.bundleUrls,
            integrity: verdict.integrity, sizeBytes: verdict.sizeBytes,
          });
          report.approved++;
          if (!latest || compareSemver(tag.version, latest) > 0) {
            await store.setLatest(entry.id, tag.version);
            latest = tag.version;
          }
        } catch (error) {
          report.errors++;
          console.error(`[plugins.sync] ${entry.id}@${tag.version}`, error);
        }
      }
    } catch (error) {
      report.errors++;
      console.error(`[plugins.sync] ${entry.id}`, error);
    }
  }
  await store.unlistExcept(new Set(registry.map((r) => r.id)));
  return report;
}

/** Valida manifiesto y bundle de un SHA. Lanza solo ante errores transitorios. */
async function inspectRelease(repo: string, id: string, tag: { version: string; sha: string }): Promise<Verdict> {
  let manifest: PluginManifest;
  try {
    manifest = parsePluginManifest(JSON.parse(await readFile(repo, "thetavlo.plugin.json", tag.sha)));
  } catch (e) {
    return reject(e, "Manifiesto inválido o ausente");
  }
  if (manifest.id !== id) return { ok: false, reason: "manifest.id no coincide con el registry" };
  if (manifest.version !== tag.version) return { ok: false, reason: "manifest.version no coincide con el tag" };

  let bytes: Uint8Array;
  try {
    bytes = await readFileBytes(repo, BUNDLE_FILE, tag.sha, MAX_BUNDLE_BYTES);
  } catch (e) {
    if (e instanceof FileTooLargeError) return { ok: false, reason: "dist/index.html supera 1 MiB" };
    if (e instanceof GitHubHttpError && e.status === 404) {
      return { ok: false, reason: "dist/index.html no existe en el commit etiquetado" };
    }
    throw e;
  }
  if (bytes.byteLength === 0) return { ok: false, reason: "dist/index.html está vacío" };

  let text: string;
  try {
    text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    return { ok: false, reason: "dist/index.html no es UTF-8 válido" };
  }
  if (!HTML_START.test(text)) return { ok: false, reason: "dist/index.html no parece HTML" };

  // Hash sobre los BYTES (no sobre el texto decodificado): es lo que verifica el cliente.
  const integrity = `sha256-${createHash("sha256").update(bytes).digest("base64")}`;
  return { ok: true, manifest, integrity, sizeBytes: bytes.byteLength, bundleUrls: buildBundleUrls(repo, tag.sha) };
}

/** Errores de contenido (JSON/validación/404) → rechazo; el resto (red, 5xx, 403) se propaga como transitorio. */
function reject(e: unknown, prefix: string): Verdict {
  if (e instanceof GitHubHttpError && e.status !== 404) throw e;
  if (e instanceof TypeError && (e as { cause?: unknown }).cause !== undefined) throw e; // fallo de red de fetch
  if (e instanceof Error && e.name === "TimeoutError") throw e;
  return { ok: false, reason: `${prefix}: ${(e as Error).message}`.slice(0, 300) };
}


const SHA_RE = /^[0-9a-f]{40}$/;
const INTEGRITY_RE = /^sha256-[A-Za-z0-9+/]{43}=$/;

/**
 * Reporte del workflow `plugin-build.yaml` (ya autenticado por OIDC en ciCallback).
 * Aun así NO se confía ciegamente en el cuerpo: se re-valida todo y se contrasta
 * el tag con GitHub antes de crear un release inmutable.
 *
 * Body esperado:
 *  { pluginId, version, sha, status: "success" | "failure",
 *    manifest?, integrity?, sizeBytes?, bundleUrls?, reason? }
 */
export async function reportBuild(db: Firestore, body: unknown) {
  if (typeof body !== "object" || body === null) throw new Error("body inválido");
  const b = body as Record<string, unknown>;

  const pluginId = parsePluginId(b.pluginId, "pluginId");
  const version = parseSemver(b.version);
  const sha = typeof b.sha === "string" && SHA_RE.test(b.sha) ? b.sha : null;
  if (!sha) throw new Error("sha inválido");
  if (b.status !== "success" && b.status !== "failure") throw new Error("status inválido");

  const store = new PluginStore(db);
  const entry = await store.getCatalog(pluginId);
  if (!entry || !entry.listed) throw new Error("plugin no listado en el registry");

  // El tag debe seguir apuntando al SHA que se construyó (anti supply-chain).
  const tag = (await listSemverTags(entry.repo)).find((t) => t.version === version);
  if (!tag || tag.sha !== sha) throw new Error("el tag no apunta al sha reportado");

  const existing = await store.getRelease(pluginId, version);
  if (existing) {
    if (existing.commitSha !== sha && existing.status !== "revoked") {
      await store.patchRelease(pluginId, version, { status: "revoked", reason: "El tag apunta a otro commit" });
      return { status: "revoked" as const };
    }
    return { status: existing.status }; // idempotente: reintentos del workflow
  }

  if (b.status === "failure") {
    const reason = typeof b.reason === "string" && b.reason ? b.reason : "El build falló";
    await store.createRelease({
      pluginId, version, commitSha: sha, status: "rejected", manifest: null, reason: reason.slice(0, 300),
    });
    return { status: "rejected" as const };
  }

  const manifest = parsePluginManifest(b.manifest);
  if (manifest.id !== pluginId) throw new Error("manifest.id no coincide");
  if (manifest.version !== version) throw new Error("manifest.version no coincide");

  const integrity = typeof b.integrity === "string" && INTEGRITY_RE.test(b.integrity) ? b.integrity : null;
  if (!integrity) throw new Error("integrity inválido");
  const sizeBytes = b.sizeBytes;
  if (typeof sizeBytes !== "number" || !Number.isInteger(sizeBytes) || sizeBytes <= 0 || sizeBytes > MAX_BUNDLE_BYTES) {
    throw new Error("sizeBytes inválido");
  }

  let bundleUrls: string[];
  if (b.bundleUrls === undefined) {
    bundleUrls = buildBundleUrls(entry.repo, sha);
  } else {
    if (!Array.isArray(b.bundleUrls) || b.bundleUrls.length === 0 || b.bundleUrls.length > 3) {
      throw new Error("bundleUrls inválido");
    }
    bundleUrls = b.bundleUrls.map((u) => {
      if (typeof u !== "string" || new URL(u).protocol !== "https:") throw new Error("bundleUrls debe ser https");
      return u;
    });
  }

  await store.createRelease({
    pluginId, version, commitSha: sha, status: "approved", manifest, bundleUrls, integrity, sizeBytes,
  });
  const latest = entry.latestVersion;
  if (!latest || compareSemver(version, latest) > 0) await store.setLatest(pluginId, version);
  return { status: "approved" as const };
}