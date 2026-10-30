import {
  METHOD_PERMISSION, WRITE_METHODS,
  type HostMethod, type RpcRequest, type RpcResponse,
} from "../domain/hostProtocol";
import type { PluginPermission } from "../domain/plugin.types";

type Handler = (params: unknown) => Promise<unknown>;

export interface BridgeDeps {
  permissions: ReadonlySet<PluginPermission>;
  isReadOnly: () => boolean;
  handlers: Record<HostMethod, Handler>;
}

class TokenBucket {
  private tokens: number;
  private last = Date.now();
  constructor(private readonly capacity: number, private readonly perSecond: number) { this.tokens = capacity; }
  take(): boolean {
    const now = Date.now();
    this.tokens = Math.min(this.capacity, this.tokens + ((now - this.last) / 1000) * this.perSecond);
    this.last = now;
    if (this.tokens < 1) return false;
    this.tokens -= 1;
    return true;
  }
}

function parse(data: unknown): RpcRequest | null {
  if (!data || typeof data !== "object") return null;
  const { id, method, params } = data as Record<string, unknown>;
  return Number.isSafeInteger(id) && typeof method === "string" ? { id: id as number, method, params } : null;
}

/** Servidor RPC de UNA instancia sobre su MessagePort. Devuelve la función de cierre. */
export function attachBridge(port: MessagePort, deps: BridgeDeps): () => void {
  const bucket = new TokenBucket(30, 15); // ráfaga 30, sostenido 15 req/s por instancia
  const reply = (r: RpcResponse) => port.postMessage(r);

  port.onmessage = async (ev: MessageEvent<unknown>) => {
    const req = parse(ev.data);
    if (!req) return;
    if (!bucket.take()) return reply({ id: req.id, ok: false, error: "rate_limited" });
    if (!Object.hasOwn(METHOD_PERMISSION, req.method)) return reply({ id: req.id, ok: false, error: "unknown_method" });

    const method = req.method as HostMethod;
    if (!deps.permissions.has(METHOD_PERMISSION[method])) return reply({ id: req.id, ok: false, error: "permission_denied" });
    if (WRITE_METHODS.has(method) && deps.isReadOnly()) return reply({ id: req.id, ok: false, error: "read_only" });

    try {
      reply({ id: req.id, ok: true, result: await deps.handlers[method](req.params) });
    } catch {
      reply({ id: req.id, ok: false, error: "internal_error" }); // nunca filtrar detalles internos al plugin
    }
  };
  port.start();
  return () => { port.onmessage = null; port.close(); };
}
