import type { ReactNode } from "react";
import type { PluginInstanceRef } from "../domain/plugin.types";
import { PluginInstanceView } from "./PluginInstanceView";
import "./pluginFrame.css";

interface Props {
  instances: PluginInstanceRef[];
  emptyFallback?: ReactNode; // 0 plugins
  className?: string;
}

/**
 * Contenedor de panel: renderiza 0..N instancias, de plugins distintos o del
 * mismo plugin repetido. `key = instanceId` ⇒ cada una conserva su propio
 * iframe, canal y estado aunque se reordenen o se añadan/quiten otras.
 * (El grid del dashboard puede seguir usando WidgetRenderer: llega al mismo
 * PluginInstanceView a través del registry.)
 */
export function PanelPluginHost({ instances, emptyFallback = null, className }: Props) {
  if (instances.length === 0) return <>{emptyFallback}</>;
  return (
    <div className={className ?? "panel-plugin-host"} role="list">
      {instances.map((instance) => (
        <div key={instance.instanceId} className="panel-plugin-slot" role="listitem">
          <PluginInstanceView {...instance} />
        </div>
      ))}
    </div>
  );
}
