import { useEffect, useState } from "react";

import type { Widget } from "#features/widgets/domain/widget.entity";
import { ProductivityChartWidget } from "../../../../../../.vscode/widgets/ProductivityChartWidget";
import { DonutChartWidget } from "../../../../../../.vscode/widgets/DonutChartWidget";
import PanelsWidget from "../../panels/panelsWidget";
import useGlobalContext from "#core/globalContext/hooks/useGlobalContext";
import UpcomingDeadlinesWidget from "../../upcomingDeadLine/upcomingDeadLine";
import { ExamsTimelineWidget } from "../../examsTimeline/ExamsTimelineWidget";
import { Timestamp } from "firebase/firestore";
import usePanels from "#features/panels/presentation/hooks/usePanels";
import type { Panel } from "#features/panels/domain/panel.entity";

export default function WidgetContent({ widget }: { widget: Widget }) {
  const { state, findByRef } = usePanels();

  const [subPanels, setSubPanels] = useState<Panel[]>([]);

  useEffect(() => {
    if (!state.currentPanel) {
      console.warn("No hay panel seleccionado");
      return;
    }

    const panel = state.currentPanel;

    const loadSubPanels = async () => {
      const resolved = await Promise.all(
        panel.subPanelsId?.map((id) => findByRef(id)) || [],
      );

      setSubPanels(resolved.filter(Boolean) as Panel[]);
    };

    loadSubPanels();
  }, [state.currentPanel]);

  const panelId = useGlobalContext().state.panel.panelId;

  switch (widget.type) {
    // case "task-list":
    //   return <TaskListWidget panelId={widget.panelId} config={widget.config} />;

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
        <ExamsTimelineWidget
          items={[
            {
              examId: "1",
              examAssignatureName: "Matemáticas",
              examDate: Timestamp.fromDate(new Date()),
              icon: "IconMath",
              color: "hsl(210, 100%, 70%)",
            },
            {
              examId: "2",
              examAssignatureName: "Historia",
              examDate: Timestamp.fromDate(
                new Date(new Date().getTime() + 86400000),
              ),
              icon: "IconHistory",
              color: "hsl(30, 100%, 70%)",
            },
            {
              examId: "3",
              examAssignatureName: "Biología",
              examDate: Timestamp.fromDate(
                new Date(new Date().getTime() + 172800000),
              ),
              icon: "IconDna",
              color: "hsl(120, 100%, 70%)",
            },
          ]}
        />
      );

    // case "exam-countdown":
    //   return (
    //     <ExamCountdownWidget panelId={widget.panelId} config={widget.config} />
    //   );

    // case "statistics":
    //   return (
    //     <StatisticsWidget panelId={widget.panelId} config={widget.config} />
    //   );

    case "quick-add":
      return <DonutChartWidget panelId={panelId} />;

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

    case "productivity-chart":
      return (
        <ProductivityChartWidget panelId={panelId} config={widget.config} />
      );

    // case "notes":
    //   return <NotesWidget panelId={widget.panelId} config={widget.config} />;

    default:
      return <div>Widget no implementado: {widget.type}</div>;
  }
}
