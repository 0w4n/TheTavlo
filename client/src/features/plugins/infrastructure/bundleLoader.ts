import type { ResolvedPlugin } from "../domain/plugin.types";

const MAX_BYTES = 1024 * 1024;
const FETCH_TIMEOUT_MS = 15_000;

/**
 * Allowlist FIJA de orígenes de bundle (sin variable de entorno): GitHub raw y jsDelivr.
 * Se compara el ORIGEN parseado, nunca un prefijo de texto (`…githubusercontent.com.evil.com`).
 */
const ALLOWED_ORIGINS: ReadonlySet<string> = new Set(["https://raw.githubusercontent.com", "https://cdn.jsdelivr.net"]);

const cache = new Map<string, Promise<string>>();

function isAllowedUrl(raw: string): boolean {
  try {
    const u = new URL(raw);
    return u.protocol === "https:" && ALLOWED_ORIGINS.has(u.origin) && !u.username && !u.password;
  } catch {
    return false;
  }
}

/**
 * Descarga el bundle y VERIFICA su SHA-256 contra el valor que dio el backend
 * (canal autenticado). Prueba `bundleUrls` en orden: si una falla o su hash no coincide, la
 * descarta y pasa a la siguiente; si todas fallan, error. N instancias comparten descarga.
 */
export function loadVerifiedBundle(p: Pick<ResolvedPlugin, "pluginId" | "version" | "bundleUrls" | "integrity">) {
  const key = `${p.pluginId}@${p.version}:${p.integrity}`;
  let hit = cache.get(key);
  if (!hit) {
    hit = fetchFirstVerified(p);
    hit.catch(() => cache.delete(key));
    cache.set(key, hit);
  }
  return hit;
}

async function fetchFirstVerified(p: Pick<ResolvedPlugin, "bundleUrls" | "integrity">): Promise<string> {
  const urls = p.bundleUrls.filter(isAllowedUrl);
  if (urls.length === 0) throw new Error("bundle_origin_not_allowed");

  let lastError = new Error("bundle_unavailable");
  for (const url of urls) {
    try {
      return await fetchAndVerify(url, p.integrity);
    } catch (e) {
      lastError = e instanceof Error ? e : lastError; // sigue con el siguiente origen
    }
  }
  throw lastError;
}

async function readCapped(res: Response): Promise<Uint8Array> {
  if (Number(res.headers.get("content-length") ?? 0) > MAX_BYTES) throw new Error("bundle_too_large");
  if (!res.body) return new Uint8Array(await res.arrayBuffer());
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_BYTES) {
      void reader.cancel();
      throw new Error("bundle_too_large");
    }
    chunks.push(value);
  }
  const out = new Uint8Array(total);
  let offset = 0;
  for (const c of chunks) { out.set(c, offset); offset += c.byteLength; }
  return out;
}

async function fetchAndVerify(url: string, integrity: string): Promise<string> {
  const res = await fetch(url, {
    credentials: "omit", referrerPolicy: "no-referrer", redirect: "error", signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`bundle_http_${res.status}`);
  const bytes = await readCapped(res);

  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", bytes as BufferSource));
  const actual = `sha256-${btoa(String.fromCharCode(...digest))}`;
  if (actual !== integrity) throw new Error("bundle_integrity_mismatch");
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}
