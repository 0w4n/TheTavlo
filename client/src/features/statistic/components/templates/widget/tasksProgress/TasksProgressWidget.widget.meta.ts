import type { WidgetDefinition } from "#features/widgets/domain/widgetDefinition.types";
import { DEFAULT_STATISTIC_IDS } from "./tasksProgress.config";

// Metadata liviana: NO importa "./TasksProgressWidget" de forma estática (solo vía
// `load()`), así que el picker puede leerla sin descargar el widget.
//
// `type` es el valor que se guarda en Firestore (`widget.type`): no lo cambies.
const widget: WidgetDefinition = {
  type: "tasks-progress",
  metadata: {
    name: "Progreso de tareas",
    description: "Cuántas tareas llevas entregadas y cómo se reparten",
    icon: "IconChartDonut",
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
    lg: { x: 0, y: 0, w: 4, h: 2 },
    md: { x: 0, y: 0, w: 4, h: 2 },
    sm: { x: 0, y: 0, w: 2, h: 2 },
    xs: { x: 0, y: 0, w: 2, h: 2 },
    xxs: { x: 0, y: 0, w: 1, h: 2 },
  },
  load: () => import("./TasksProgressWidget"),
};

export default widget;
