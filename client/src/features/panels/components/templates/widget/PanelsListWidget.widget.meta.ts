import type { WidgetDefinition } from "#features/widgets/domain/widgetDefinition.types.tsypes.ts";

const panelsListWidget: WidgetDefinition = {
  type: "panels-list",
  metadata: {
    name: "Lista de Paneles",
    description: "Acceso rápido a tus paneles",
    icon: "IconFolderFilled",
    category: "productivity",
  },
  capabilities: {
    resizable: true,
  },
  defaultConfig: {
    showIcons: true,
  },
  defaultLayout: {
    lg: { x: 0, y: 0, w: 3, h: 2 },
    md: { x: 0, y: 0, w: 3, h: 2 },
    sm: { x: 0, y: 0, w: 2, h: 4 },
    xs: { x: 0, y: 0, w: 2, h: 4 },
    xxs: { x: 0, y: 0, w: 1, h: 2 },
  },
  load: () => import("./PanelsListWidget"),
  quickAdd: {
    load: () => import("./addPanel/addPanels"),
  },
};

export default panelsListWidget;
