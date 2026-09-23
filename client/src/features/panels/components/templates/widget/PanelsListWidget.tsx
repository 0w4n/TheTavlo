import usePanels from "#features/panels/presentation/hooks/usePanels";
import PanelsWidget from "./panelsWidget";

// El WidgetRenderer genérico solo pasa {widgetId, panelId, config}: no tiene
// forma de saber que "panels-list" necesita los sub-paneles del panel
// actual. Este wrapper es el único lugar que conoce ese detalle — resuelve
// `subPanels` vía el propio contexto de paneles y delega en el componente
// de presentación real (`PanelsWidget`), que no cambió.
export default function PanelsListWidget({
  multiSelection,
}: {
  multiSelection: boolean;
}) {
  const { state } = usePanels();
  const subPanels = state.status === "panel" ? state.subPanels : [];

  return (
    <PanelsWidget
      items={subPanels}
      config={{ typeView: "list" }}
      multiSelection={multiSelection}
    />
  );
}
