import { afterEach, describe, expect, it, vi } from "vitest";
import { loadVerifiedBundle } from "./bundleLoader";

const RAW = "https://raw.githubusercontent.com/acme/notes/" + "a".repeat(40) + "/dist/index.html";
const CDN = "https://cdn.jsdelivr.net/gh/acme/notes@" + "a".repeat(40) + "/dist/index.html";
const GOOD = "<!doctype html><p>bueno ñ</p>";

async function integrityOf(text: string) {
  const d = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text)));
  return `sha256-${btoa(String.fromCharCode(...d))}`;
}
let n = 0;
const plugin = async (bundleUrls: string[], body = GOOD) =>
  ({ pluginId: `acme.p${++n}`, version: "1.0.0", bundleUrls, integrity: await integrityOf(body) });

const mockFetch = (map: Record<string, () => Response>) => {
  const spy = vi.fn(async (url: string, _init?: RequestInit) => (map[url] ? map[url]!() : new Response("nf", { status: 404 })));
  vi.stubGlobal("fetch", spy);
  return spy;
};

afterEach(() => vi.unstubAllGlobals());

describe("loadVerifiedBundle", () => {
  it("usa la 1ª URL si el hash coincide (y no toca la 2ª)", async () => {
    const spy = mockFetch({ [RAW]: () => new Response(GOOD), [CDN]: () => new Response(GOOD) });
    expect(await loadVerifiedBundle(await plugin([RAW, CDN]))).toBe(GOOD);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0]![1]).toMatchObject({ credentials: "omit", redirect: "error", referrerPolicy: "no-referrer" });
  });

  it("hash distinto en la 1ª URL → descarta y usa la 2ª", async () => {
    const spy = mockFetch({ [RAW]: () => new Response("<html>manipulado</html>"), [CDN]: () => new Response(GOOD) });
    expect(await loadVerifiedBundle(await plugin([RAW, CDN]))).toBe(GOOD);
    expect(spy.mock.calls.map((c) => c[0])).toEqual([RAW, CDN]);
  });

  it("HTTP 404/error de red en la 1ª → usa la 2ª", async () => {
    mockFetch({ [CDN]: () => new Response(GOOD) });
    expect(await loadVerifiedBundle(await plugin([RAW, CDN]))).toBe(GOOD);
  });

  it("todas fallan → error (hash distinto en ambas)", async () => {
    mockFetch({ [RAW]: () => new Response("x"), [CDN]: () => new Response("y") });
    await expect(loadVerifiedBundle(await plugin([RAW, CDN]))).rejects.toThrow("bundle_integrity_mismatch");
  });

  it("orígenes fuera de la allowlist (incluido el truco del sufijo) no se piden", async () => {
    const evil = "https://raw.githubusercontent.com.evil.com/x/index.html";
    const spy = mockFetch({ [evil]: () => new Response(GOOD) });
    const bad = ["http://raw.githubusercontent.com/x", evil, "https://user:pw@cdn.jsdelivr.net/x", "https://example.com/b/x", "no-url"];
    await expect(loadVerifiedBundle(await plugin(bad))).rejects.toThrow("bundle_origin_not_allowed");
    expect(spy).not.toHaveBeenCalled();
  });

  it("rechaza bundles > 1 MiB", async () => {
    mockFetch({ [RAW]: () => new Response("a".repeat(1024 * 1024 + 1)) });
    await expect(loadVerifiedBundle(await plugin([RAW], "a".repeat(1024 * 1024 + 1)))).rejects.toThrow("bundle_too_large");
  });
});
