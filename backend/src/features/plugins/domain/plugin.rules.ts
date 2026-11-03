import { REPO_RE } from "./manifest.validator.js";

export const PLUGIN_TYPE_PREFIX = "plugin:";
export const pluginWidgetType = (pluginId: string, widgetKey: string) =>
  `${PLUGIN_TYPE_PREFIX}${pluginId}/${widgetKey}`;

/** `plugin:<id>/<key>` → partes. Es la ÚNICA fuente del pluginId en el servidor. */
export function parsePluginWidgetType(type: unknown): { pluginId: string; widgetKey: string } | null {
  if (typeof type !== "string" || !type.startsWith(PLUGIN_TYPE_PREFIX)) return null;
  const [pluginId, widgetKey, ...rest] = type.slice(PLUGIN_TYPE_PREFIX.length).split("/");
  return pluginId && widgetKey && rest.length === 0 ? { pluginId, widgetKey } : null;
}

export function compareSemver(a: string, b: string): number {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < 3; i++) if (pa[i] !== pb[i]) return pa[i]! - pb[i]!;
  return 0;
}

const SHA_RE = /^[0-9a-f]{40}$/;

/** URLs de descarga construidas SIEMPRE por el backend, pinneadas al commit. Orden = prioridad. */
export function buildBundleUrls(repo: string, sha: string): string[] {
  if (!REPO_RE.test(repo) || !SHA_RE.test(sha)) throw new Error("repo o sha inválido");
  return [
    `https://raw.githubusercontent.com/${repo}/${sha}/dist/index.html`,
    `https://cdn.jsdelivr.net/gh/${repo}@${sha}/dist/index.html`,
  ];
}
