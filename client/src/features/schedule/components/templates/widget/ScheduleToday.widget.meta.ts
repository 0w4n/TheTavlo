import type { WidgetDefinition } from "#features/widgets/domain/widgetDefinition.types";

// Metadata liviana: NO importa "./ScheduleToday" de forma estática — solo lo referencia
// a través de load(), así el picker puede leer este archivo sin descargar el
// componente (ver widgetDiscovery.ts).
const widget: WidgetDefinition = {
  type: "schedule-today",
  metadata: {
    name: "Clases de hoy",
    description: "Tu agenda del día, con asistencia",
    icon: "IconCalendarEvent",
    category: "events",
  },
  capabilities: { resizable: true, configurable: false },
  defaultConfig: {},
  defaultLayout: {
    lg: { x: 0, y: 0, w: 4, h: 3 },
    md: { x: 0, y: 0, w: 5, h: 3 },
    sm: { x: 0, y: 0, w: 3, h: 3 },
    xs: { x: 0, y: 0, w: 4, h: 3 },
    xxs: { x: 0, y: 0, w: 2, h: 3 },
  },
  load: () => import("./ScheduleToday"),
};

export default widget;
