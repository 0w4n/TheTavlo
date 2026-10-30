/** Dispara .github/workflows/plugin-build.yaml. El build NUNCA corre en el backend. */
export async function dispatchPluginBuild(p: { pluginId: string; version: string; repo: string; sha: string }) {
  const res = await fetch(`https://api.github.com/repos/${process.env.PLUGIN_BUILD_REPO}/dispatches`, {
    method: "POST",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: JSON.stringify({
      event_type: "plugin-build",
      client_payload: { ...p, env: process.env.APP_ENV === "production" ? "production" : "development" },
    }),
    signal: AbortSignal.timeout(10_000),
  });
  if (res.status !== 204) throw new Error(`dispatch falló (${res.status})`);
}
