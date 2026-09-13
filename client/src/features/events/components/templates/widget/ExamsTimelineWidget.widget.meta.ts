import type { WidgetDefinition } from "#core/widgets/domain/widgetDefinition.types";

const examTimelineWidget: WidgetDefinition = {
  type: "exam-timeline",
  metadata: {
    name: "Timeline de Exámenes",
    description: "Línea de tiempo de próximos exámenes",
    icon: "IconTimeline",
    category: "exams",
  },
  defaultConfig: {
    daysAhead: 30,
  },
  defaultLayout: {
    lg: { x: 0, y: 0, w: 3, h: 2 },
    md: { x: 0, y: 0, w: 3, h: 2 },
    sm: { x: 0, y: 0, w: 2, h: 1 },
    xs: { x: 0, y: 0, w: 2, h: 1 },
    xxs: { x: 0, y: 0, w: 1, h: 2 },
  },
  load: () => import("./ExamsTimelineWidget"),
};

export default examTimelineWidget;
