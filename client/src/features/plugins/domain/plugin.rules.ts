export const PLUGIN_TYPE_PREFIX = "plugin:";

export const pluginWidgetType = (pluginId: string, widgetKey: string) =>
  `${PLUGIN_TYPE_PREFIX}${pluginId}/${widgetKey}`;

export function parsePluginWidgetType(type: string): { pluginId: string; widgetKey: string } | null {
  if (!type.startsWith(PLUGIN_TYPE_PREFIX)) return null;
  const [pluginId, widgetKey] = type.slice(PLUGIN_TYPE_PREFIX.length).split("/");
  return pluginId && widgetKey ? { pluginId, widgetKey } : null;
}
