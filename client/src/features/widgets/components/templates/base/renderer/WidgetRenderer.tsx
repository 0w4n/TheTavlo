import { Suspense } from "react";
import { widgetRegistry } from "#features/widgets/infraestructure/widgetDiscovery";
import { getLazyWidgetComponent } from "../component/widgetComponentCache";
import UnknownWidget from "../unknown/UnknownWidget";
import WidgetSkeleton from "../skeleton/WidgetSkeleton";
import WidgetErrorBoundary from "../errorBoundary/WidgetErrorBoundary";

export interface WidgetRendererProps {
  /** `widget.type` — la clave con la que se busca en el WidgetRegistry. */
  type: string;
  widgetId: string;
  panelId?: string;
  config?: Record<string, unknown>;
  multiSelection?: boolean;
}

/**
 * Renderiza cualquier widget a partir de su `type`, sin conocerlo de
 * antemano: ni switch, ni `if (type === "...")`, ni imports directos de
 * ningún widget concreto. Todo se resuelve vía `widgetRegistry`.
 *
 * Un `type` que no está en el registro (widget eliminado, de una versión
 * más nueva, o un documento corrupto) cae en `UnknownWidget` en vez de
 * romper el dashboard.
 */
export default function WidgetRenderer({
  type,
  widgetId,
  panelId,
  config = {},
  multiSelection,
}: WidgetRendererProps) {
  const definition = widgetRegistry.get(type);

  if (!definition) {
    return <UnknownWidget type={type} />;
  }

  const Component = getLazyWidgetComponent(definition);

  return (
    <WidgetErrorBoundary>
      <Suspense fallback={<WidgetSkeleton />}>
        <Component
          widgetId={widgetId}
          panelId={panelId}
          config={config}
          multiSelection={multiSelection}
        />
      </Suspense>
    </WidgetErrorBoundary>
  );
}
