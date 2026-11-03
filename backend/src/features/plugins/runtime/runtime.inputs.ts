import { asEnum, asObject, asString, badRequest } from "../domain/validators.js";

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

export const SCOPE_KEYS = ["ownerId", "ownerAccountType", "panelId"] as const;
export const INSTANCE_KEYS = [...SCOPE_KEYS, "widgetId"] as const;

const KEY_RE = /^[A-Za-z0-9_.-]{1,64}$/;
const MAX_PATCH_BYTES = 16_384;

/** Extrae el scope de un objeto ya comprobado (el llamante aplica el rechazo de claves extra). */
export function pickScope(o: Record<string, unknown>): ScopeInput {
  return {
    ownerId: asString(o.ownerId, "ownerId", { max: 128 }),
    ownerAccountType: asEnum(o.ownerAccountType, ["users", "guests"] as const, "ownerAccountType"),
    panelId: asString(o.panelId, "panelId", { max: 128 }),
  };
}

export function pickInstance(o: Record<string, unknown>): InstanceInput {
  return { ...pickScope(o), widgetId: asString(o.widgetId, "widgetId", { max: 128 }) };
}

export const parseScope = (raw: unknown): ScopeInput => pickScope(asObject(raw, SCOPE_KEYS, "scope"));
export const parseInstance = (raw: unknown): InstanceInput => pickInstance(asObject(raw, INSTANCE_KEYS, "instancia"));

function parsePatch(raw: unknown): Record<string, unknown> {
  const patch = asObject(raw, undefined, "patch");
  if (JSON.stringify(patch).length > MAX_PATCH_BYTES) badRequest("patch demasiado grande.");
  for (const key of Object.keys(patch)) {
    if (!KEY_RE.test(key)) badRequest("patch contiene una clave inválida.");
  }
  return patch;
}

export function parsePatchInput(raw: unknown): PatchInput {
  const o = asObject(raw, [...INSTANCE_KEYS, "patch"], "instancia");
  return { ...pickInstance(o), patch: parsePatch(o.patch) };
}
