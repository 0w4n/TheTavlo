import type { ComponentType } from "react";
import type { WidgetComponentProps, WidgetDefinition } from "#features/widgets/domain/widgetDefinition.types";
import { PluginInstanceView } from "../components/PluginInstanceView";
import { pluginWidgetType } from "../domain/plugin.rules";
import type { ResolvedPlugin } from "../domain/plugin.types";

// El WidgetRenderer cachea `lazy(load)` por `type`: el componente debe ser estable
// por type y leer versión/permisos del runtime en cada render (no por closure).
const components = new Map<string, ComponentType<WidgetComponentProps>>();

function componentFor(pluginId: string, widgetKey: string) {
  const type = pluginWidgetType(pluginId, widgetKey);
  let Component = components.get(type);
  if (!Component) {
    Component = function PluginWidget({ widgetId, config }: WidgetComponentProps) {
      return <PluginInstanceView instanceId={widgetId} pluginId={pluginId} widgetKey={widgetKey} config={config} />;
    };
    components.set(type, Component);
  }
  return Component;
}

/** Cada widget del manifiesto → un WidgetDefinition normal del registry existente. */
export function toWidgetDefinitions(plugin: ResolvedPlugin): WidgetDefinition[] {
  return plugin.manifest.widgets.map((w) => ({
    type: pluginWidgetType(plugin.pluginId, w.key),
    metadata: { name: w.name, description: w.description, icon: w.icon, category: w.category },
    capabilities: { resizable: w.resizable, configurable: false },
    defaultConfig: w.defaultConfig,
    defaultLayout: w.defaultLayout,
    load: async () => ({ default: componentFor(plugin.pluginId, w.key) }),
  }));
}
