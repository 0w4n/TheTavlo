import type { WidgetDefinition } from "#features/widgets/domain/widgetDefinition.types.tsypes.ts";

const cookingBookWidget: WidgetDefinition = {
  type: "cooking-book",
  metadata: {
    name: "Libro de cocina",
    description: "Tus recetas guardadas, a la mano",
    icon: "IconChefHat",
    category: "productivity",
  },
  defaultConfig: {},
  defaultLayout: {
    lg: { x: 0, y: 0, w: 3, h: 2 },
    md: { x: 0, y: 0, w: 3, h: 2 },
    sm: { x: 0, y: 0, w: 2, h: 1 },
    xs: { x: 0, y: 0, w: 2, h: 1 },
    xxs: { x: 0, y: 0, w: 1, h: 2 },
  },
  load: () => import("./CookingBook"),
};

export default cookingBookWidget;
