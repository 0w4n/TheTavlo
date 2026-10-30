import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "../../../trpc/trpc.js";
import { syncCatalog } from "../app/sync.service.js";
import { PERMISSIONS, pluginIdSchema, semverSchema } from "../domain/manifest.schema.js";
import { compareSemver } from "../domain/plugin.rules.js";
import type { MarketplaceListing } from "../domain/plugin.types.js";
import { PluginStore } from "../infrastructure/pluginStore.firestore.js";

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  const admins = (process.env.PLUGIN_ADMIN_UIDS ?? "").split(",").filter(Boolean);
  if (!admins.includes(ctx.user.uid)) throw new TRPCError({ code: "FORBIDDEN" });
  return next();
});

const notFound = () => new TRPCError({ code: "NOT_FOUND", message: "Plugin no disponible." });

export const marketplaceRouter = router({
  list: protectedProcedure
    .input(z.object({ query: z.string().max(60).optional() }))
    .query(async ({ ctx, input }): Promise<MarketplaceListing[]> => {
      const store = new PluginStore(ctx.db);
      const q = input.query?.trim().toLowerCase();
      const catalog = await store.listListed();
      const releases = await store.getReleases(catalog.map((c) => ({ id: c.id, version: c.latestVersion! })));
      const installed = ctx.user.isAnonymous ? [] : await store.listInstalled("users", ctx.user.uid);
      const installedBy = new Map(installed.map((i) => [i.pluginId, i.version]));

      return catalog.flatMap((c, i) => {
        const m = releases[i]?.status === "approved" ? releases[i]!.manifest : null;
        if (!m) return [];
        if (q && !`${m.name} ${m.description} ${m.id}`.toLowerCase().includes(q)) return [];
        return [{
          id: c.id, name: m.name, description: m.description, author: m.author.name, tier: c.tier,
          version: m.version, permissions: m.permissions, widgetCount: m.widgets.length,
          installedVersion: installedBy.get(c.id) ?? null,
        }];
      });
    }),

  get: protectedProcedure.input(z.object({ pluginId: pluginIdSchema })).query(async ({ ctx, input }) => {
    const store = new PluginStore(ctx.db);
    const entry = await store.getCatalog(input.pluginId);
    if (!entry?.listed) throw notFound();
    const approved = (await store.listReleases(input.pluginId)).filter((r) => r.status === "approved");
    const latest = approved.sort((a, b) => compareSemver(b.version, a.version))[0];
    if (!latest?.manifest) throw notFound();
    return {
      id: entry.id, repository: `https://github.com/${entry.repo}`, tier: entry.tier,
      manifest: latest.manifest, versions: approved.map((r) => r.version),
    };
  }),

  install: protectedProcedure
    .input(z.object({
      pluginId: pluginIdSchema,
      version: semverSchema.optional(),
      grantedPermissions: z.array(z.enum(PERMISSIONS)).max(PERMISSIONS.length),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.isAnonymous) throw new TRPCError({ code: "FORBIDDEN", message: "Crea una cuenta para instalar plugins." });
      const store = new PluginStore(ctx.db);
      const entry = await store.getCatalog(input.pluginId);
      const version = input.version ?? entry?.latestVersion;
      const release = entry?.listed && version ? await store.getRelease(input.pluginId, version) : null;
      if (!release || release.status !== "approved" || !release.manifest) throw notFound();

      const missing = release.manifest.permissions.filter((p) => !input.grantedPermissions.includes(p));
      if (missing.length) {
        throw new TRPCError({ code: "BAD_REQUEST", message: `Faltan permisos por aceptar: ${missing.join(", ")}` });
      }
      await store.setInstall("users", ctx.user.uid, {
        pluginId: input.pluginId, version: release.version, grantedPermissions: input.grantedPermissions,
      });
      return { pluginId: input.pluginId, version: release.version };
    }),

  uninstall: protectedProcedure.input(z.object({ pluginId: pluginIdSchema })).mutation(async ({ ctx, input }) => {
    if (ctx.user.isAnonymous) throw new TRPCError({ code: "FORBIDDEN" });
    await new PluginStore(ctx.db).removeInstall("users", ctx.user.uid, input.pluginId);
    return { pluginId: input.pluginId };
  }),

  /** Sincroniza con GitHub bajo demanda (además del job programado / de deploy). */
  sync: adminProcedure.mutation(({ ctx }) => syncCatalog(ctx.db)),
});
