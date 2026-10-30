import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../../../trpc/trpc.js";
// Requiere exportar `assertReadable` y `widgetsCollection` en widgets.router.ts (ver INTEGRATION.md)
import { assertReadable, widgetsCollection } from "../../widgets/widgets.router.js";
import { PLUGIN_TYPE_PREFIX } from "../domain/plugin.rules.js";
import type { ResolvedPlugin } from "../domain/plugin.types.js";
import { PluginStore } from "../infrastructure/pluginStore.firestore.js";
import { PluginPermission } from "../domain/manifest.schema.js";

export interface ScopeInput {
  ownerId: string;
  ownerAccountType: "users" | "guests";
  panelId: string;
}

export interface InstanceInput extends ScopeInput {
  widgetId: string;
}

export interface PatchInput extends InstanceInput {
  patch: Record<string, unknown>;
}

const KEY_RE = /^[A-Za-z0-9_.-]{1,64}$/;
const MAX_STATE_BYTES = 64 * 1024;
const MAX_PATCH_BYTES = 16_384;

function validateString(val: unknown, name: string): string {
  if (typeof val !== "string" || val.length < 1 || val.length > 128) {
    throw new TRPCError({ code: "BAD_REQUEST", message: `Invalid ${name}` });
  }
  return val;
}

function validateScope(input: unknown): ScopeInput {
  if (!input || typeof input !== "object") {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid input" });
  }
  const obj = input as Record<string, unknown>;
  const ownerId = validateString(obj.ownerId, "ownerId");
  const ownerAccountType = obj.ownerAccountType;
  if (ownerAccountType !== "users" && ownerAccountType !== "guests") {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid ownerAccountType" });
  }
  const panelId = validateString(obj.panelId, "panelId");
  return { ownerId, ownerAccountType: ownerAccountType as "users" | "guests", panelId };
}

function validateInstance(input: unknown): InstanceInput {
  const scope = validateScope(input);
  const obj = input as Record<string, unknown>;
  const widgetId = validateString(obj.widgetId, "widgetId");
  return { ...scope, widgetId };
}

function validatePatch(input: unknown): Record<string, unknown> {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Patch debe ser un objeto" });
  }
  const patch = input as Record<string, unknown>;
  const stringified = JSON.stringify(patch);
  if (stringified.length > MAX_PATCH_BYTES) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "patch demasiado grande" });
  }
  for (const key of Object.keys(patch)) {
    if (!KEY_RE.test(key)) {
      throw new TRPCError({ code: "BAD_REQUEST", message: `Clave de patch inválida: ${key}` });
    }
  }
  return patch;
}

function validatePatchInput(input: unknown): PatchInput {
  const instance = validateInstance(input);
  const obj = input as Record<string, unknown>;
  const patch = validatePatch(obj.patch);
  return { ...instance, patch };
}

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
  forPanel: protectedProcedure.input(validateScope).query(async ({ ctx, input }): Promise<ResolvedPlugin[]> => {
    await assertReadable(ctx, input);
    const store = new PluginStore(ctx.db);
    const installed = await store.listInstalled(input.ownerAccountType, input.ownerId);
    const releases = await store.getReleases(installed.map((i) => ({ id: i.pluginId, version: i.version })));
    return installed.flatMap((i, idx) => {
      const r = releases[idx];
      if (!r || r.status !== "approved" || !r.manifest || !r.bundleUrl || !r.integrity) return [];
      return [{
        pluginId: i.pluginId, version: i.version, manifest: r.manifest,
        bundleUrl: r.bundleUrl, integrity: r.integrity,
        permissions: r.manifest.permissions.filter((p: PluginPermission) => i.grantedPermissions.includes(p)),
      }];
    });
  }),

  getState: protectedProcedure.input(validateInstance).query(async ({ ctx, input }) => {
    const ref = await instanceStateRef(ctx, input, false);
    return ((await ref.get()).data()?.data ?? {}) as Record<string, unknown>;
  }),

  patchState: protectedProcedure
    .input(validatePatchInput)
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
});