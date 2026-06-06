import { useEffect, useState } from "react";

import type { Widget } from "#features/widgets/domain/widget.entity";
import PanelsWidget from "../../panels/panelsWidget";
import UpcomingDeadlinesWidget from "../../upcomingDeadLine/upcomingDeadLine";
import ExamsTimelineWidget from "../../examsTimeline/examsTimelineWidget";
import usePanels from "#features/panels/presentation/hooks/usePanels";
import type { Panel } from "#features/panels/domain/panel.entity";
import { TaskWidget } from "../../task/taskWidget";

export default function WidgetContent({ widget }: { widget: Widget }) {
  const { state, findByRef, findBySharedId } = usePanels();

  const [subPanels, setSubPanels] = useState<Panel[]>([]);

  useEffect(() => {
    if (!state.currentPanel) {
      console.warn("No hay panel seleccionado");
      return;
    }

    const panel = state.currentPanel;

    console.log(
      panel.subPanelsId
    );

    const loadSubPanels = async () => {
      const resolved = await Promise.all(
        panel.subPanelsId?.map(async (ref) => {
          try {
            if (ref.path.includes("panels")) {
              console.log("Buscando subPanel por referencia:", ref);
              const subPanel = await findByRef(ref);
              console.log("SubPanel encontrado por referencia:", subPanel);
              return subPanel;
            } else if (ref.path.includes("shared")) {
              const subPanel = await findBySharedId(ref);
              console.log("SubPanel encontrado por ID compartido:", subPanel);
              return subPanel;
            } else {
              console.warn("Referencia desconocida:", ref);
              return [];
            }
          } catch (error) {
            console.error("Error al cargar el subPanel:", error);
            return null;
          }
        }),
      );

      setSubPanels(resolved.filter(Boolean) as Panel[]);
    };

    console.info("Cargando subPaneles para el panel actual:", subPanels);

    loadSubPanels();
  }, [state.currentPanel]);

  switch (widget.type) {
    case "task-list":
      return (
        <TaskWidget /* panelId={state.currentPanel!} config={widget.config} */
        />
      );

    case "panels-list":
      return (
        <PanelsWidget
          items={subPanels.filter((panel) => panel !== undefined)}
        />
      );

    // case "event-calendar":
    //   return (
    //     <EventCalendarWidget panelId={widget.panelId} config={widget.config} />
    //   );

    // case "event-list":
    //   return (
    //     <EventListWidget panelId={widget.panelId} config={widget.config} />
    //   );

    case "exam-timeline":
      return <ExamsTimelineWidget />;

    // case "exam-countdown":
    //   return (
    //     <ExamCountdownWidget panelId={widget.panelId} config={widget.config} />
    //   );

    // case "statistics":
    //   return (
    //     <StatisticsWidget panelId={widget.panelId} config={widget.config} />
    //   );

    // case "quick-add":
    //   return <DonutChartWidget panelId={panelId} />;

    // case "recent-activity":
    //   return (
    //     <RecentActivityWidget panelId={widget.panelId} config={widget.config} />
    //   );

    case "upcoming-deadlines":
      return (
        <UpcomingDeadlinesWidget
        // panelId={widget.panelId}
        // config={widget.config}
        />
      );

    // case "productivity-chart":
    //   return (
    //     <ProductivityChartWidget panelId={panelId} config={widget.config} />
    //   );

    // case "notes":
    //   return <NotesWidget panelId={widget.panelId} config={widget.config} />;

    default:
      return <div>Widget no implementado: {widget.type}</div>;
  }
}
