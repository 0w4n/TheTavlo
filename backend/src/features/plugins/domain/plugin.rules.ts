export const PLUGIN_TYPE_PREFIX = "plugin:";
export const pluginWidgetType = (pluginId: string, widgetKey: string) =>
  `${PLUGIN_TYPE_PREFIX}${pluginId}/${widgetKey}`;

export function compareSemver(a: string, b: string): number {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < 3; i++) if (pa[i] !== pb[i]) return pa[i]! - pb[i]!;
  return 0;
}
