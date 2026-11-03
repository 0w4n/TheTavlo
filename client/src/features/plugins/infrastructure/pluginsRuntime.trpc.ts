import { TRPCRequestError, trpcMutation, trpcQuery } from "#core/appCore/infrastructure/api/trpcClient";
import { HostRpcError, RPC_ERROR_CODES, type RpcErrorCode } from "../domain/hostProtocol";
import type { PanelScope, ResolvedPlugin } from "../domain/plugin.types";

export const fetchPanelPlugins = (scope: PanelScope) =>
  trpcQuery<ResolvedPlugin[]>("plugins.runtime.forPanel", scope);

export const getInstanceState = (scope: PanelScope, widgetId: string) =>
  trpcQuery<Record<string, unknown>>("plugins.runtime.getState", { ...scope, widgetId });

export const patchInstanceState = (scope: PanelScope, widgetId: string, patch: Record<string, unknown>) =>
  trpcMutation<Record<string, unknown>>("plugins.runtime.patchState", { ...scope, widgetId, patch });

// ── plugins.runtime.db.* ──────────────────────────────────────────────────────────────────────
export type DbTarget = "instance" | "panel";
export interface DbWhere {
  field: string;
  op: "==" | "<" | "<=" | ">" | ">=" | "array-contains";
  value: string | number | boolean | null;
}
export interface DbListOptions {
  limit?: number;
  startAfter?: string;
  where?: DbWhere;
  orderBy?: { field: string; direction?: "asc" | "desc" };
}
export interface DbDocument { id: string; path: string; data: Record<string, unknown> }

/** Traduce el error de tRPC a un código de la lista cerrada que el plugin sí puede ver. */
async function asHostError<T>(call: Promise<T>): Promise<T> {
  try {
    return await call;
  } catch (e) {
    const code = e instanceof TRPCRequestError ? e.trpcCode?.toLowerCase() : undefined;
    if (code && (RPC_ERROR_CODES as readonly string[]).includes(code)) throw new HostRpcError(code as RpcErrorCode);
    throw e;
  }
}

// `scope` y `widgetId` van SIEMPRE los últimos: lo que venga en `args` nunca puede sobrescribirlos.
const withInstance = (scope: PanelScope, widgetId: string, args: object) => ({ ...args, ...scope, widgetId });

export const dbGet = (scope: PanelScope, widgetId: string, args: { target: DbTarget; path: string }) =>
  asHostError(trpcQuery<DbDocument | null>("plugins.runtime.db.get", withInstance(scope, widgetId, args)));

export const dbList = (scope: PanelScope, widgetId: string, args: { target: DbTarget; path: string } & DbListOptions) =>
  asHostError(trpcQuery<{ docs: DbDocument[]; nextCursor: string | null }>("plugins.runtime.db.list", withInstance(scope, widgetId, args)));

export const dbCollections = (scope: PanelScope, widgetId: string, args: { target: DbTarget; path?: string }) =>
  asHostError(trpcQuery<{ collections: string[] }>("plugins.runtime.db.collections", withInstance(scope, widgetId, args)));

export const dbCreate = (scope: PanelScope, widgetId: string, args: { target: DbTarget; path: string; data: Record<string, unknown> }) =>
  asHostError(trpcMutation<{ id: string; path: string }>("plugins.runtime.db.create", withInstance(scope, widgetId, args)));

export const dbSet = (scope: PanelScope, widgetId: string, args: { target: DbTarget; path: string; data: Record<string, unknown>; merge?: boolean }) =>
  asHostError(trpcMutation<{ id: string; path: string }>("plugins.runtime.db.set", withInstance(scope, widgetId, args)));

export const dbUpdate = (scope: PanelScope, widgetId: string, args: { target: DbTarget; path: string; data: Record<string, unknown> }) =>
  asHostError(trpcMutation<{ id: string; path: string }>("plugins.runtime.db.update", withInstance(scope, widgetId, args)));

export const dbDelete = (scope: PanelScope, widgetId: string, args: { target: DbTarget; path: string }) =>
  asHostError(trpcMutation<{ deleted: boolean }>("plugins.runtime.db.delete", withInstance(scope, widgetId, args)));

export const dbDeleteCollection = (scope: PanelScope, widgetId: string, args: { target: DbTarget; path: string }) =>
  asHostError(trpcMutation<{ deleted: number; hasMore: boolean }>("plugins.runtime.db.deleteCollection", withInstance(scope, widgetId, args)));
