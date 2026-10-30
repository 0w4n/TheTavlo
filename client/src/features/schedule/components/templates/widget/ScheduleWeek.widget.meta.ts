import type { WidgetDefinition } from "#features/widgets/domain/widgetDefinition.types";

// Metadata liviana: NO importa "./ScheduleWeek" de forma estática — solo lo referencia
// a través de load(), así el picker puede leer este archivo sin descargar el
// componente (ver widgetDiscovery.ts).
const widget: WidgetDefinition = {
  type: "schedule-week",
  metadata: {
    name: "Horario semanal",
    description: "Tu semana de clases en una parrilla",
    icon: "IconCalendarWeek",
    category: "events",
  },
  capabilities: { resizable: true, configurable: false },
  defaultConfig: {},
  defaultLayout: {
    lg: { x: 0, y: 0, w: 8, h: 4 },
    md: { x: 0, y: 0, w: 10, h: 4 },
    sm: { x: 0, y: 0, w: 6, h: 4 },
    xs: { x: 0, y: 0, w: 4, h: 4 },
    xxs: { x: 0, y: 0, w: 2, h: 4 },
  },
  load: () => import("./ScheduleWeek"),
};

export default widget;
