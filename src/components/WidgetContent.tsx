import type { Widget } from "#features/widgets/domain/widget.entity";
import { ProductivityChartWidget } from "./widgets/ProductivityChartWidget";
import { DonutChartWidget } from "./widgets/DonutChartWidget";
import usePanels from "#features/panels/presentation/hooks/usePanels";
import PanelsWidget from "./templates/widgets/panels/panelsWidget";

export default function WidgetContent({ widget }: { widget: Widget }) {
  const panelId = usePanels().state!.panelId!;

  switch (widget.type) {
    // case "task-list":
    //   return <TaskListWidget panelId={widget.panelId} config={widget.config} />;

    case "panels-list":
      return (
        <PanelsWidget
          items={[
            { panelId: "1", icon: "IconFolder", color: "#FF5733" },
            { panelId: "2", icon: "IconStar", color: "#33FF57" },
            { panelId: "3", icon: "IconHeart", color: "#3357FF" },
          ]}
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

    // case "exam-timeline":
    //   return (
    //     <ExamTimelineWidget panelId={widget.panelId} config={widget.config} />
    //   );

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

    // case "upcoming-deadlines":
    //   return (
    //     <UpcomingDeadlinesWidget
    //       panelId={widget.panelId}
    //       config={widget.config}
    //     />
    //   );

    case "productivity-chart":
      return (
        <ProductivityChartWidget
          panelId={panelId}
          config={widget.config}
        />
      );

    // case "notes":
    //   return <NotesWidget panelId={widget.panelId} config={widget.config} />;

    default:
      return <div>Widget no implementado: {widget.type}</div>;
  }
}
