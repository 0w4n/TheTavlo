import type { PluginPermission } from "./plugin.types";

export const PROTOCOL_VERSION = 1;

/** Tabla única: método RPC → permiso requerido. Lo que no está aquí no existe. */
export const METHOD_PERMISSION = {
  "storage.get": "instance.storage",
  "storage.patch": "instance.storage",
  "toast.show": "notifications.toast",
} as const satisfies Record<string, PluginPermission>;

export type HostMethod = keyof typeof METHOD_PERMISSION;
export const WRITE_METHODS: ReadonlySet<string> = new Set<HostMethod>(["storage.patch"]);

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
