import type { WidgetDefinition } from "#core/widgets/domain/widgetDefinition.types";

// Metadata liviana del widget de tareas. A propósito NO importa
// "./TaskWidget" ni "./AddTask" de forma estática — solo los referencia a
// través de `load()`, así que este archivo se puede leer (para el picker
// "Añadir widget", por ejemplo) sin descargar ninguno de los dos.
const taskListWidget: WidgetDefinition = {
  type: "task-list",
  metadata: {
    name: "Lista de Tareas",
    description: "Visualiza tus tareas en formato lista",
    icon: "IconCheckbox",
    category: "tasks",
  },
  capabilities: {
    resizable: true,
    configurable: true,
  },
  defaultConfig: {
    showCompleted: false,
    sortBy: "dueDate",
    filterPriority: null,
  },
  defaultLayout: {
    lg: { x: 0, y: 0, w: 3, h: 2 },
    md: { x: 0, y: 0, w: 3, h: 2 },
    sm: { x: 0, y: 0, w: 2, h: 1 },
    xs: { x: 0, y: 0, w: 2, h: 1 },
    xxs: { x: 0, y: 0, w: 1, h: 2 },
  },
  load: () => import("./TaskWidget"),
  quickAdd: {
    load: () => import("./AddTask"),
  },
};

export default taskListWidget;
