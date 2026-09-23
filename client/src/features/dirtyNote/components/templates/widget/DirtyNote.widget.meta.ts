import type { WidgetDefinition } from "#features/widgets/domain/widgetDefinition.types";

// Metadata liviana: NO importa "./DirtyNote.widget" ni "./AddDirtyNote" de
// forma estática (solo vía `load()`), así que el picker "Añadir widget" puede
// leerla sin descargar el editor, marked ni DOMPurify.
//
// `type` es el valor que se guarda en Firestore (`widget.type`): no lo cambies.
const dirtyNoteWidget: WidgetDefinition = {
  type: "dirty-note",
  metadata: {
    name: "DirtyNote",
    description:
      "Escribe en Markdown, márcalas como sucio, en progreso o final y descárgalas en .md o .pdf",
    icon: "IconMarkdown",
    category: "productivity",
  },
  capabilities: {
    resizable: true,
    configurable: false,
  },
  defaultConfig: {},
  defaultLayout: {
    lg: { x: 0, y: 0, w: 3, h: 2 },
    md: { x: 0, y: 0, w: 3, h: 2 },
    sm: { x: 0, y: 0, w: 2, h: 2 },
    xs: { x: 0, y: 0, w: 2, h: 2 },
    xxs: { x: 0, y: 0, w: 1, h: 2 },
  },
  load: () => import("./DirtyNote.widget"),
  quickAdd: {
    load: () => import("./AddDirtyNote"),
  },
};

export default dirtyNoteWidget;
