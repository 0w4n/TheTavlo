import type { PluginPermission } from "./plugin.types";

export const PROTOCOL_VERSION = 1;

/** Tabla única: método RPC → permiso requerido. Lo que no está aquí no existe. */
export const METHOD_PERMISSION = {
  "storage.get": "instance.storage",
  "storage.patch": "instance.storage",
  "toast.show": "notifications.toast",
  "db.get": "db.read",
  "db.list": "db.read",
  "db.collections": "db.read",
  "db.create": "db.write",
  "db.set": "db.write",
  "db.update": "db.write",
  "db.delete": "db.write",
  "db.deleteCollection": "db.write",
} as const satisfies Record<string, PluginPermission>;

export type HostMethod = keyof typeof METHOD_PERMISSION;
export const WRITE_METHODS: ReadonlySet<string> = new Set<HostMethod>([
  "storage.patch", "db.create", "db.set", "db.update", "db.delete", "db.deleteCollection",
]);

/** Únicos errores del backend que el plugin puede ver (cualquier otro → `internal_error`). */
export const RPC_ERROR_CODES = [
  "bad_request", "forbidden", "not_found", "conflict", "precondition_failed", "too_many_requests", "payload_too_large",
] as const;
export type RpcErrorCode = (typeof RPC_ERROR_CODES)[number];

/** Error seguro de mostrar al plugin: solo lleva un código de la lista cerrada. */
export class HostRpcError extends Error {
  readonly code: RpcErrorCode;
  constructor(code: RpcErrorCode) {
    super(code);
    this.name = "HostRpcError";
    this.code = code;
  }
}

export interface RpcRequest { id: number; method: string; params?: unknown }
export type RpcResponse =
  | { id: number; ok: true; result: unknown }
  | { id: number; ok: false; error: string };

/** host → plugin, por el MessagePort dedicado de la instancia. */
export type HostEvent = { event: "config"; payload: Record<string, unknown> };

/** host → plugin, único mensaje por window.postMessage (transfiere el puerto). */
export interface InitMessage {
  type: "tavlo:init";
  protocol: typeof PROTOCOL_VERSION;
  instanceId: string;
  widgetKey: string;
  config: Record<string, unknown>;
  readOnly: boolean;
  permissions: PluginPermission[];
}
