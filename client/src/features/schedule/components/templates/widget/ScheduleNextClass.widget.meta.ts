import type { WidgetDefinition } from "#features/widgets/domain/widgetDefinition.types";

// Metadata liviana: NO importa "./ScheduleNextClass" de forma estática — solo lo referencia
// a través de load(), así el picker puede leer este archivo sin descargar el
// componente (ver widgetDiscovery.ts).
const widget: WidgetDefinition = {
  type: "schedule-next-class",
  metadata: {
    name: "Próxima clase",
    description: "Cuánto falta para tu siguiente clase",
    icon: "IconClockPlay",
    category: "events",
  },
  capabilities: { resizable: true, configurable: false },
  defaultConfig: {},
  defaultLayout: {
    lg: { x: 0, y: 0, w: 3, h: 2 },
    md: { x: 0, y: 0, w: 4, h: 2 },
    sm: { x: 0, y: 0, w: 3, h: 2 },
    xs: { x: 0, y: 0, w: 4, h: 2 },
    xxs: { x: 0, y: 0, w: 2, h: 2 },
  },
  load: () => import("./ScheduleNextClass"),
};

export default widget;
