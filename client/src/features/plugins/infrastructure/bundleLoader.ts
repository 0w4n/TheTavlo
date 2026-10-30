import type { ResolvedPlugin } from "../domain/plugin.types";

const MAX_BYTES = 1024 * 1024;
const ALLOWED_ORIGIN = import.meta.env.CLIENT_PLUGINS_ORIGIN as string | undefined; // p.ej. https://storage.googleapis.com/thetavlo-plugins
const cache = new Map<string, Promise<string>>();

/**
 * Descarga el bundle y VERIFICA su SHA-256 contra el valor que dio el backend
 * (canal autenticado). Si el bucket/CDN fuera manipulado, el hash no coincide
 * y el plugin no se ejecuta. N instancias del mismo plugin comparten descarga.
 */
export function loadVerifiedBundle(p: Pick<ResolvedPlugin, "pluginId" | "version" | "bundleUrl" | "integrity">) {
  const key = `${p.pluginId}@${p.version}:${p.integrity}`;
  let hit = cache.get(key);
  if (!hit) {
    hit = fetchAndVerify(p);
    hit.catch(() => cache.delete(key));
    cache.set(key, hit);
  }
  return hit;
}

async function fetchAndVerify(p: Pick<ResolvedPlugin, "bundleUrl" | "integrity">): Promise<string> {
  if (!ALLOWED_ORIGIN || !p.bundleUrl.startsWith(`${ALLOWED_ORIGIN}/`)) throw new Error("bundle_origin_not_allowed");
  const res = await fetch(p.bundleUrl, { credentials: "omit", referrerPolicy: "no-referrer", redirect: "error" });
  if (!res.ok) throw new Error(`bundle_http_${res.status}`);
  const buf = await res.arrayBuffer();
  if (buf.byteLength > MAX_BYTES) throw new Error("bundle_too_large");

  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", buf));
  const actual = `sha256-${btoa(String.fromCharCode(...digest))}`;
  if (actual !== p.integrity) throw new Error("bundle_integrity_mismatch");
  return new TextDecoder("utf-8", { fatal: true }).decode(buf);
}
