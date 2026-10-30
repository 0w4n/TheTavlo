const REPO_RE = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;
const MAX_FILE_BYTES = 64 * 1024;

async function gh(path: string, accept = "application/vnd.github+json"): Promise<Response> {
  const res = await fetch(`https://api.github.com${path}`, {
    headers: {
      Accept: accept,
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`, // Secret Manager → env en Cloud Run
      "X-GitHub-Api-Version": "2022-11-28",
    },
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`GitHub ${res.status} en ${path.split("?")[0]}`);
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

/** Lee un archivo pequeño en un commit concreto (o en la rama por defecto si ref se omite). */
export async function readFile(repo: string, file: string, ref?: string): Promise<string> {
  assertRepo(repo);
  const q = ref ? `?ref=${encodeURIComponent(ref)}` : "";
  const res = await gh(`/repos/${repo}/contents/${file}${q}`, "application/vnd.github.raw+json");
  const text = await res.text();
  if (text.length > MAX_FILE_BYTES) throw new Error(`${file} excede ${MAX_FILE_BYTES} bytes`);
  return text;
}
