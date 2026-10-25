import type { WidgetDefinition } from "#features/widgets/domain/widgetDefinition.types";
import { DEFAULT_STATISTIC_IDS } from "./tasksWorkload.config";

// Metadata liviana: NO importa "./TasksWorkloadWidget" de forma estática (solo vía
// `load()`), así que el picker puede leerla sin descargar el widget.
//
// `type` es el valor que se guarda en Firestore (`widget.type`): no lo cambies.
const widget: WidgetDefinition = {
  type: "tasks-workload",
  metadata: {
    name: "Carga próxima",
    description: "Qué se te viene encima en las próximas semanas",
    icon: "IconCalendarStats",
    category: "productivity",
  },
  capabilities: {
    resizable: true,
    configurable: false,
  },
  defaultConfig: {
    statisticIds: [...DEFAULT_STATISTIC_IDS],
  },
  defaultLayout: {
    lg: { x: 0, y: 0, w: 4, h: 3 },
    md: { x: 0, y: 0, w: 4, h: 3 },
    sm: { x: 0, y: 0, w: 2, h: 3 },
    xs: { x: 0, y: 0, w: 2, h: 3 },
    xxs: { x: 0, y: 0, w: 1, h: 3 },
  },
  load: () => import("./TasksWorkloadWidget"),
};

export default widget;
