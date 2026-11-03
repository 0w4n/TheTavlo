import { HostRpcError, type HostMethod } from "../domain/hostProtocol";
import type { PanelScope } from "../domain/plugin.types";
import {
  dbCollections, dbCreate, dbDelete, dbDeleteCollection, dbGet, dbList, dbSet, dbUpdate,
  getInstanceState, patchInstanceState,
  type DbListOptions, type DbTarget, type DbWhere,
} from "../infrastructure/pluginsRuntime.trpc";

export interface CapabilityContext {
  scope: PanelScope;
  instanceId: string;
  onToast?: (message: string) => void;
}

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object" && !Array.isArray(v) && Object.getPrototypeOf(v) === Object.prototype;

const badParams = () => new HostRpcError("bad_request");

/** Parámetros del plugin: solo se copian campos conocidos; el resto se descarta (el servidor revalida todo). */
function params(raw: unknown): Record<string, unknown> {
  if (!isPlainObject(raw)) throw badParams();
  return raw;
}
const target = (p: Record<string, unknown>): DbTarget => {
  if (p.target === undefined) return "instance";
  if (p.target === "instance" || p.target === "panel") return p.target;
  throw badParams();
};
const path = (p: Record<string, unknown>): string => {
  if (typeof p.path !== "string") throw badParams();
  return p.path;
};
const data = (p: Record<string, unknown>): Record<string, unknown> => {
  if (!isPlainObject(p.data)) throw badParams();
  return p.data;
};

function listOptions(p: Record<string, unknown>): DbListOptions {
  const o: DbListOptions = {};
  if (p.limit !== undefined) {
    if (typeof p.limit !== "number") throw badParams();
    o.limit = p.limit;
  }
  if (p.startAfter !== undefined) {
    if (typeof p.startAfter !== "string") throw badParams();
    o.startAfter = p.startAfter;
  }
  if (p.where !== undefined) {
    if (!isPlainObject(p.where)) throw badParams();
    o.where = { field: p.where.field, op: p.where.op, value: p.where.value } as DbWhere;
  }
  if (p.orderBy !== undefined) {
    if (!isPlainObject(p.orderBy)) throw badParams();
    o.orderBy = {
      field: p.orderBy.field as string,
      ...(p.orderBy.direction !== undefined ? { direction: p.orderBy.direction as "asc" | "desc" } : {}),
    };
  }
  return o;
}

/**
 * Capacidades que el host expone. Cada una está atada al `scope` y al `instanceId` de SU
 * instancia: un plugin no puede direccionar el estado ni los datos de otra instancia (ni de otro
 * panel) aunque quiera, porque esos ids nunca vienen en los parámetros que él controla.
 */
export function createCapabilities(get: () => CapabilityContext): Record<HostMethod, (p: unknown) => Promise<unknown>> {
  const ids = () => [get().scope, get().instanceId] as const;
  return {
    "storage.get": () => getInstanceState(get().scope, get().instanceId),
    "storage.patch": async (raw) => {
      if (!isPlainObject(raw)) throw new Error("bad_params");
      return patchInstanceState(get().scope, get().instanceId, raw);
    },
    "toast.show": async (raw) => {
      const message = isPlainObject(raw) && typeof raw.message === "string" ? raw.message.slice(0, 200) : "";
      if (message) get().onToast?.(message); // siempre texto plano, nunca HTML
      return null;
    },

    "db.get": async (raw) => { const p = params(raw); return dbGet(...ids(), { target: target(p), path: path(p) }); },
    "db.list": async (raw) => { const p = params(raw); return dbList(...ids(), { target: target(p), path: path(p), ...listOptions(p) }); },
    "db.collections": async (raw) => {
      const p = params(raw);
      if (p.path !== undefined && typeof p.path !== "string") throw badParams();
      return dbCollections(...ids(), { target: target(p), ...(p.path !== undefined ? { path: p.path as string } : {}) });
    },
    "db.create": async (raw) => { const p = params(raw); return dbCreate(...ids(), { target: target(p), path: path(p), data: data(p) }); },
    "db.set": async (raw) => {
      const p = params(raw);
      if (p.merge !== undefined && typeof p.merge !== "boolean") throw badParams();
      return dbSet(...ids(), { target: target(p), path: path(p), data: data(p), ...(p.merge !== undefined ? { merge: p.merge } : {}) });
    },
    "db.update": async (raw) => { const p = params(raw); return dbUpdate(...ids(), { target: target(p), path: path(p), data: data(p) }); },
    "db.delete": async (raw) => { const p = params(raw); return dbDelete(...ids(), { target: target(p), path: path(p) }); },
    "db.deleteCollection": async (raw) => { const p = params(raw); return dbDeleteCollection(...ids(), { target: target(p), path: path(p) }); },
  };
}
