import type { WidgetDefinition } from "#features/widgets/domain/widgetDefinition.types.tsypes.ts";

const upcomingDeadlinesWidget: WidgetDefinition = {
  type: "upcoming-deadlines",
  metadata: {
    name: "Próximos Vencimientos",
    description: "Alertas de fechas límite",
    icon: "IconAlertTriangle",
    category: "productivity",
  },
  defaultConfig: {
    daysAhead: 3,
  },
  defaultLayout: {
    lg: { x: 0, y: 0, w: 4, h: 3 },
  },
  load: () => import("./UpcomingDeadlinesWidget"),
};

export default upcomingDeadlinesWidget;
