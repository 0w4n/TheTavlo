import type { WidgetDefinition } from "#features/widgets/domain/widgetDefinition.types";

// Metadata liviana: NO importa "./ScheduleAttendance" de forma estática — solo lo referencia
// a través de load(), así el picker puede leer este archivo sin descargar el
// componente (ver widgetDiscovery.ts).
const widget: WidgetDefinition = {
  type: "schedule-attendance",
  metadata: {
    name: "Asistencia",
    description: "Cómo vas de asistencia en cada asignatura",
    icon: "IconUserCheck",
    category: "productivity",
  },
  capabilities: { resizable: true, configurable: false },
  defaultConfig: {
    minAttendance: 80,
  },
  defaultLayout: {
    lg: { x: 0, y: 0, w: 4, h: 3 },
    md: { x: 0, y: 0, w: 5, h: 3 },
    sm: { x: 0, y: 0, w: 3, h: 3 },
    xs: { x: 0, y: 0, w: 4, h: 3 },
    xxs: { x: 0, y: 0, w: 2, h: 3 },
  },
  load: () => import("./ScheduleAttendance"),
};

export default widget;
