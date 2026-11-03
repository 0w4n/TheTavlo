import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../../../trpc/trpc.js";
// Requiere exportar `assertReadable` y `widgetsCollection` en widgets.router.ts (ver INTEGRATION.md)
import { assertReadable, widgetsCollection } from "../../widgets/widgets.router.js";
import type { PluginPermission } from "../domain/manifest.validator.js";
import { PLUGIN_TYPE_PREFIX } from "../domain/plugin.rules.js";
import type { ResolvedPlugin } from "../domain/plugin.types.js";
import { PluginStore } from "../infrastructure/pluginStore.firestore.js";
import { dbRouter } from "./db/db.router.js";
import { parseInstance, parsePatchInput, parseScope, type InstanceInput } from "./runtime.inputs.js";

const MAX_STATE_BYTES = 64 * 1024;

/** Referencia al doc de estado de UNA instancia: …/widgets/{id}/pluginData/state */
async function instanceStateRef(ctx: any, input: InstanceInput, write: boolean) {
  await assertReadable(ctx, input, write);
  const widget = widgetsCollection(ctx, input).doc(input.widgetId);
  const snap = await widget.get();
  if (!snap.exists || !String(snap.data()?.type).startsWith(PLUGIN_TYPE_PREFIX)) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Instancia de plugin no encontrada." });
  }
  return widget.collection("pluginData").doc("state");
}

export const runtimeRouter = router({
  /**
   * Plugins resueltos para un panel = los instalados por el DUEÑO del panel
   * (así un invitado ve los mismos plugins). Releases revocadas desaparecen
   * al instante → kill-switch.
   */
  forPanel: protectedProcedure.input(parseScope).query(async ({ ctx, input }): Promise<ResolvedPlugin[]> => {
    await assertReadable(ctx, input);
    const store = new PluginStore(ctx.db);
    const installed = await store.listInstalled(input.ownerAccountType, input.ownerId);
    const releases = await store.getReleases(installed.map((i) => ({ id: i.pluginId, version: i.version })));
    return installed.flatMap((i, idx) => {
      const r = releases[idx];
      if (!r || r.status !== "approved" || !r.manifest || !r.bundleUrls?.length || !r.integrity) return [];
      return [{
        pluginId: i.pluginId, version: i.version, manifest: r.manifest,
        bundleUrls: r.bundleUrls, integrity: r.integrity,
        permissions: r.manifest.permissions.filter((p: PluginPermission) => i.grantedPermissions.includes(p)),
      }];
    });
  }),

  getState: protectedProcedure.input(parseInstance).query(async ({ ctx, input }) => {
    const ref = await instanceStateRef(ctx, input, false);
    return ((await ref.get()).data()?.data ?? {}) as Record<string, unknown>;
  }),

  patchState: protectedProcedure
    .input(parsePatchInput)
    .mutation(async ({ ctx, input }) => {
      const ref = await instanceStateRef(ctx, input, true);
      const current = ((await ref.get()).data()?.data ?? {}) as Record<string, unknown>;
      const next = { ...current, ...(JSON.parse(JSON.stringify(input.patch)) as Record<string, unknown>) };
      if (JSON.stringify(next).length > MAX_STATE_BYTES) {
        throw new TRPCError({ code: "PAYLOAD_TOO_LARGE", message: "El estado del plugin excede 64 KB." });
      }
      await ref.set({ data: next, updatedAt: new Date().toISOString() });
      return next;
    }),

  /** CRUD de documentos/colecciones del plugin (plugins.runtime.db.*). */
  db: dbRouter,
});