import { describe, expect, it, vi } from "vitest";
import { HostRpcError } from "../domain/hostProtocol";
import type { PluginPermission } from "../domain/plugin.types";
import { attachBridge } from "./hostBridge";

type Reply = { id: number; ok: boolean; error?: string; result?: unknown };

function setup(permissions: PluginPermission[], readOnly = false, handler = vi.fn(async () => "ok")) {
  const { port1, port2 } = new MessageChannel();
  const replies: Reply[] = [];
  port2.onmessage = (e) => replies.push(e.data as Reply);
  const close = attachBridge(port1, {
    permissions: new Set(permissions),
    isReadOnly: () => readOnly,
    handlers: new Proxy({}, { get: () => handler }) as never,
  });
  const call = async (method: string, params?: unknown) => {
    const id = replies.length + 1000 + Math.floor(Math.random() * 1e6);
    port2.postMessage({ id, method, params });
    await vi.waitFor(() => expect(replies.some((r) => r.id === id)).toBe(true));
    return replies.find((r) => r.id === id)!;
  };
  return { call, handler, close: () => { close(); port2.close(); } };
}

describe("hostBridge con db.*", () => {
  it("db.get requiere db.read; db.set requiere db.write", async () => {
    const t = setup(["db.read"]);
    expect((await t.call("db.get", { path: "a/b" })).ok).toBe(true);
    expect(await t.call("db.set", { path: "a/b", data: {} })).toMatchObject({ ok: false, error: "permission_denied" });
    expect(await t.call("db.list", { path: "a" })).toMatchObject({ ok: true });
    t.close();
  });

  it("modo solo lectura bloquea TODAS las escrituras db.*", async () => {
    const t = setup(["db.read", "db.write"], true);
    for (const m of ["db.create", "db.set", "db.update", "db.delete", "db.deleteCollection"]) {
      expect(await t.call(m, { path: "a" })).toMatchObject({ ok: false, error: "read_only" });
    }
    expect((await t.call("db.get", { path: "a/b" })).ok).toBe(true);
    expect(t.handler).toHaveBeenCalledTimes(1);
    t.close();
  });

  it("método desconocido → unknown_method; HostRpcError → su código; otro error → internal_error", async () => {
    const t = setup(["db.read"], false, vi.fn(async () => { throw new HostRpcError("not_found"); }));
    expect(await t.call("db.drop")).toMatchObject({ error: "unknown_method" });
    expect(await t.call("db.get", { path: "a/b" })).toMatchObject({ ok: false, error: "not_found" });
    t.close();
    const u = setup(["db.read"], false, vi.fn(async () => { throw new Error("detalle interno /users/x"); }));
    expect(await u.call("db.get", { path: "a/b" })).toMatchObject({ ok: false, error: "internal_error" });
    u.close();
  });
});
