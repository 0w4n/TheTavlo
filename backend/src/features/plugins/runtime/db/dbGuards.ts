import { TRPCError, type TRPC_ERROR_CODE_KEY } from "@trpc/server";
import { assertReadable, widgetsCollection } from "../../../widgets/widgets.router.js";
import type { PluginPermission } from "../../domain/manifest.validator.js";
import { parsePluginWidgetType } from "../../domain/plugin.rules.js";
import { PluginStore } from "../../infrastructure/pluginStore.firestore.js";
import { asObject, badRequest } from "../../domain/validators.js";
import type { InstanceInput } from "../runtime.inputs.js";

export const DB_LIMITS = {
  maxDocBytes: 32 * 1024,
  maxDocsPerNamespace: 1000,
  maxDataDepth: 8,
  maxListLimit: 100,
  /** 499 borrados + 1 escritura del contador = 500 (límite de escrituras por commit). */
  maxDeletePerCall: 499,
} as const;

const DATA_KEY_RE = /^[A-Za-z0-9_.-]{1,64}$/;

export type DbData = Record<string, unknown>;

const err = (code: TRPC_ERROR_CODE_KEY, message: string) => new TRPCError({ code, message });
export const quotaError = () =>
  err("TOO_MANY_REQUESTS", `Se alcanzó el máximo de ${DB_LIMITS.maxDocsPerNamespace} documentos.`);

// ── Control de acceso en servidor (el bridge del cliente NO es el único control) ──────────────
/**
 * Comprueba, en CADA llamada y con el `pluginId` derivado del `type` del widget:
 * acceso al panel (viewers solo lectura), widget plugin existente, plugin instalado por el
 * DUEÑO, release `approved` (kill-switch) y permiso ∈ manifest ∩ concedidos.
 */
export async function assertDbAccess(ctx: any, scope: InstanceInput, permission: Extract<PluginPermission, "db.read" | "db.write">) {
  await assertReadable(ctx, scope, permission === "db.write");
  const widgetSnap = await widgetsCollection(ctx, scope).doc(scope.widgetId).get();
  const parsed = parsePluginWidgetType(widgetSnap.exists ? widgetSnap.data()?.type : undefined);
  if (!parsed) throw err("NOT_FOUND", "Instancia de plugin no encontrada.");

  const store = new PluginStore(ctx.db);
  const install = await store.getInstall(scope.ownerAccountType, scope.ownerId, parsed.pluginId);
  const release = install ? (await store.getReleases([{ id: parsed.pluginId, version: install.version }]))[0] : null;
  const manifest = release?.status === "approved" ? release.manifest : null;

  if (!install || !manifest || !manifest.widgets.some((w) => w.key === parsed.widgetKey)) {
    throw err("FORBIDDEN", "El plugin no está disponible en este panel.");
  }
  if (!manifest.permissions.includes(permission) || !install.grantedPermissions.includes(permission)) {
    throw err("FORBIDDEN", "El plugin no tiene permiso para esta operación.");
  }
  return { pluginId: parsed.pluginId };
}

// ── Datos ───────────────────────────────────────────────────────────────────────────────────
function walk(value: unknown, depth: number, inArray: boolean): void {
  if (value === null || typeof value === "boolean" || typeof value === "string") return;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) badRequest("Hay un número no válido en los datos.");
    return;
  }
  if (depth + 1 > DB_LIMITS.maxDataDepth) badRequest(`Los datos superan ${DB_LIMITS.maxDataDepth} niveles de profundidad.`);
  if (Array.isArray(value)) {
    if (inArray) badRequest("Firestore no admite listas anidadas directamente.");
    for (const item of value) walk(item, depth + 1, true);
    return;
  }
  if (typeof value === "object") {
    for (const [key, nested] of Object.entries(value)) {
      if (!DATA_KEY_RE.test(key) || key.startsWith("__")) badRequest("Los datos contienen una clave no válida.");
      walk(nested, depth + 1, false);
    }
    return;
  }
  badRequest("Los datos solo pueden contener JSON (sin undefined ni funciones).");
}

export const docBytes = (data: DbData) => Buffer.byteLength(JSON.stringify(data), "utf8");

export function assertDocSize(data: DbData): void {
  if (docBytes(data) > DB_LIMITS.maxDocBytes) {
    throw err("PAYLOAD_TOO_LARGE", `El documento supera ${DB_LIMITS.maxDocBytes / 1024} KB.`);
  }
}

/** Solo JSON: claves seguras, profundidad ≤ 8, sin listas anidadas. El tamaño (≤ 32 KB) lo
 *  comprueba el handler con `assertDocSize`, porque tRPC convierte todo fallo de un parser en BAD_REQUEST. */
export function parseDocumentData(raw: unknown, field = "data"): DbData {
  const obj = asObject(raw, undefined, field);
  walk(obj, 0, false);
  return JSON.parse(JSON.stringify(obj)) as DbData;
}

const isPlain = (v: unknown): v is DbData => typeof v === "object" && v !== null && !Array.isArray(v);

/** Semántica de `set(..., { merge: true })`: mapas se fusionan en profundidad, listas y escalares se reemplazan. */
export function deepMerge(base: DbData, patch: DbData): DbData {
  const out: DbData = { ...base };
  for (const [key, value] of Object.entries(patch)) {
    const current = out[key];
    out[key] = isPlain(current) && isPlain(value) ? deepMerge(current, value) : value;
  }
  return out;
}

// ── Errores de Firestore → TRPCError limpios (sin rutas internas ni URLs de índices) ────────
const GRPC: Record<string, { code: TRPC_ERROR_CODE_KEY; message: string }> = {
  "3": { code: "BAD_REQUEST", message: "Datos o consulta no válidos para el almacenamiento." },
  "5": { code: "NOT_FOUND", message: "El documento no existe." },
  "6": { code: "CONFLICT", message: "El documento ya existe." },
  "8": { code: "TOO_MANY_REQUESTS", message: "Cuota de almacenamiento agotada; reintenta más tarde." },
  "9": { code: "PRECONDITION_FAILED", message: "La consulta requiere un índice que no existe." },
  "10": { code: "CONFLICT", message: "Conflicto de escritura concurrente; reintenta." },
  "4": { code: "TIMEOUT", message: "El almacenamiento tardó demasiado; reintenta." },
  "14": { code: "SERVICE_UNAVAILABLE", message: "Almacenamiento no disponible; reintenta." },
};
const NAMES: Record<string, string> = {
  INVALID_ARGUMENT: "3", NOT_FOUND: "5", ALREADY_EXISTS: "6", RESOURCE_EXHAUSTED: "8", FAILED_PRECONDITION: "9",
  ABORTED: "10", DEADLINE_EXCEEDED: "4", UNAVAILABLE: "14",
};

export function mapFirestoreError(e: unknown): TRPCError {
  if (e instanceof TRPCError) return e;
  const raw = (e as { code?: unknown } | null)?.code;
  const key = typeof raw === "number" ? String(raw) : typeof raw === "string" ? (NAMES[raw.toUpperCase().replace(/-/g, "_")] ?? raw) : "";
  // PERMISSION_DENIED (7) en Admin SDK es IAM (roles/datastore.user), no una regla: error de servidor.
  console.error("[plugins.db] error de Firestore", { code: raw });
  const mapped = GRPC[key];
  return mapped ? err(mapped.code, mapped.message) : err("INTERNAL_SERVER_ERROR", "Error interno del almacenamiento.");
}

export async function withFirestoreErrors<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (e) {
    throw mapFirestoreError(e);
  }
}
