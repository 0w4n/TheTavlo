import { useEffect, useState } from "react";

import type { Widget } from "#features/widgets/domain/widget.entity";
import PanelsWidget from "../../panels/panelsWidget";
import UpcomingDeadlinesWidget from "../../upcomingDeadLine/upcomingDeadLine";
import ExamsTimelineWidget from "../../examsTimeline/examsTimelineWidget";
import { Timestamp } from "firebase/firestore";
import usePanels from "#features/panels/presentation/hooks/usePanels";
import type { Panel } from "#features/panels/domain/panel.entity";
import { TaskWidget } from "../../task/taskWidget";

export default function WidgetContent({ widget }: { widget: Widget }) {
  const { state, findByRef } = usePanels();

  const [subPanels, setSubPanels] = useState<Panel[]>([]);

  useEffect(() => {
    if (!state.currentPanel) {
      console.warn("No hay panel seleccionado");
      return;
    }

    const panel = state.currentPanel;

    console.log("Cargando subpaneles para el panel:", panel.id);

    const loadSubPanels = async () => {
      const resolved = await Promise.all(
        panel.subPanelsId?.map((id) => findByRef(id)) || [],
      );

      console.log("Subpaneles resueltos:", resolved);

      setSubPanels(resolved.filter(Boolean) as Panel[]);
    };

    loadSubPanels();
  }, [state.currentPanel]);

  switch (widget.type) {
    case "task-list":
      return <TaskWidget /* panelId={state.currentPanel!} config={widget.config} */ />;

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
      return (
        <ExamsTimelineWidget />
      );

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
