import WidgetErrorBoundary from "#features/widgets/components/templates/base/errorBoundary/WidgetErrorBoundary";
import type { PluginInstanceRef } from "../domain/plugin.types";
import { usePluginRuntime } from "../presentation/hooks/usePluginRuntime";
import { SandboxedPluginFrame } from "./SandboxedPluginFrame";

/** Una instancia aislada: error boundary propio + iframe propio + estado propio. */
export function PluginInstanceView({ instanceId, pluginId, widgetKey, config }: PluginInstanceRef) {
  const { plugins, scope, readOnly, onToast } = usePluginRuntime();
  const plugin = plugins.get(pluginId);
  const widget = plugin?.manifest.widgets.find((w) => w.key === widgetKey);

  if (!plugin || !widget) {
    return <p role="status">Plugin no disponible (desinstalado, revocado o aún no instalado por el dueño del panel).</p>;
  }
  return (
    <WidgetErrorBoundary>
      <SandboxedPluginFrame
        plugin={plugin}
        widgetKey={widgetKey}
        instanceId={instanceId}
        title={`${plugin.manifest.name} — ${widget.name}`}
        config={config}
        scope={scope}
        readOnly={readOnly}
        onToast={onToast}
      />
    </WidgetErrorBoundary>
  );
}
