import { widgetRegistry } from "#features/widgets/infrastructure/widgetDiscovery";
import { PLUGIN_TYPE_PREFIX } from "../domain/plugin.rules";
import type { ResolvedPlugin } from "../domain/plugin.types";
import { toWidgetDefinitions } from "./pluginWidgetDefinition";

/** Reconcilia el registry con los plugins resueltos (alta, upgrade, revocación). */
export function syncWidgetRegistry(plugins: ResolvedPlugin[]): void {
  const wanted = new Map(plugins.flatMap(toWidgetDefinitions).map((d) => [d.type, d] as const));

  for (const def of widgetRegistry.getAll()) {
    if (def.type.startsWith(PLUGIN_TYPE_PREFIX) && !wanted.has(def.type)) widgetRegistry.unregister(def.type);
  }
  for (const def of wanted.values()) {
    widgetRegistry.unregister(def.type);
    widgetRegistry.register(def);
  }
}
