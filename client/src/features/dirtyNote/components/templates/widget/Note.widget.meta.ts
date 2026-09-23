import type { WidgetDefinition } from "#features/widgets/domain/widgetDefinition.types";

const notesWidget: WidgetDefinition = {
  type: "notes",
  metadata: {
    name: "Notas Rápidas",
    description: "Bloc de notas del panel",
    icon: "IconNotes",
    category: "other",
  },
  defaultConfig: {
    content: "",
  },
  defaultLayout: {
    lg: { x: 0, y: 0, w: 4, h: 4 },
  },
  load: () => import("./DirtyNote.widget"),
};

export default notesWidget;
