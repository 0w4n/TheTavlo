import { REPO_RE } from "../domain/manifest.validator.js";

const MAX_MANIFEST_BYTES = 64 * 1024;
const RAW = "application/vnd.github.raw+json";

/** Respuesta HTTP no satisfactoria de la API de GitHub (404 = permanente para un SHA dado). */
export class GitHubHttpError extends Error {
  constructor(readonly status: number, path: string) {
    super(`GitHub ${status} en ${path.split("?")[0]}`);
  }
}
/** El archivo supera el tope pedido. */
export class FileTooLargeError extends Error {
  constructor(file: string, maxBytes: number) {
    super(`${file} excede ${maxBytes} bytes`);
  }
}

async function gh(path: string, accept = "application/vnd.github+json"): Promise<Response> {
  const res = await fetch(`https://api.github.com${path}`, {
    headers: {
      Accept: accept,
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`, // solo lectura de contenidos
      "X-GitHub-Api-Version": "2022-11-28",
    },
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new GitHubHttpError(res.status, path);
  return res;
}

export function assertRepo(repo: string): void {
  if (!REPO_RE.test(repo)) throw new Error("repo inválido");
}

/** Solo tags semver estables (v1.2.3 | 1.2.3). Cada tag se resuelve a su commit SHA. */
export async function listSemverTags(repo: string): Promise<Array<{ version: string; sha: string }>> {
  assertRepo(repo);
  const tags = (await (await gh(`/repos/${repo}/tags?per_page=30`)).json()) as Array<{ name: string; commit: { sha: string } }>;
  return tags.flatMap((t) => {
    const m = /^v?(\d+\.\d+\.\d+)$/.exec(t.name);
    return m ? [{ version: m[1]!, sha: t.commit.sha }] : [];
  });
}

/** Lee un archivo como BYTES (media type raw) en un commit concreto, cortando al superar `maxBytes`. */
export async function readFileBytes(repo: string, file: string, ref: string | undefined, maxBytes: number): Promise<Uint8Array> {
  assertRepo(repo);
  const q = ref ? `?ref=${encodeURIComponent(ref)}` : "";
  const res = await gh(`/repos/${repo}/contents/${file}${q}`, RAW);
  if (Number(res.headers.get("content-length") ?? 0) > maxBytes) throw new FileTooLargeError(file, maxBytes);
  if (!res.body) return new Uint8Array(0);

  const chunks: Uint8Array[] = [];
  let total = 0;
  for await (const chunk of res.body as unknown as AsyncIterable<Uint8Array>) {
    total += chunk.byteLength;
    if (total > maxBytes) throw new FileTooLargeError(file, maxBytes);
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

/** Archivo de texto pequeño (manifiesto, registry). UTF-8 estricto. */
export async function readFile(repo: string, file: string, ref?: string): Promise<string> {
  const bytes = await readFileBytes(repo, file, ref, MAX_MANIFEST_BYTES);
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}
