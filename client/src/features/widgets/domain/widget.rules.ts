import type { LayoutItem } from "react-grid-layout";
import type { ResponsiveLayout } from "./widget.entity";

// El layout por defecto de cada tipo de widget ya no vive en un mapa
// central aquí — cada widget lo declara en su propio `*.widget.meta.ts`
// (campo `defaultLayout`), junto al resto de su metadata. Esta clase se
// queda solo con las reglas de grid que sí son universales (constantes,
// validación, helper de construcción de LayoutItem).
export class WidgetRules {
  static readonly GRID_COLUMNS = 12;
  static readonly ROW_HEIGHT = 30; // pixels
  static readonly GRID_GAP = 16; // pixels

  /** Se usa cuando un widget no declaró `defaultLayout` en su definición. */
  static readonly FALLBACK_LAYOUT: ResponsiveLayout = {
    lg: { x: 0, y: 0, w: 4, h: 3 },
  };

  static createLayoutItem(w: number, h: number): Omit<LayoutItem, "i"> {
    return { x: 0, y: 0, w, h };
  }

  static validateLayout(layout: Omit<LayoutItem, "i">): string | null {
    if (layout.x < 0 || layout.y < 0) {
      return "La posición no puede ser negativa";
    }
    if (layout.w <= 0 || layout.h <= 0) {
      return "El tamaño debe ser mayor a 0";
    }
    if (layout.x + layout.w > this.GRID_COLUMNS) {
      return "El widget se sale del grid";
    }
    if (layout.minW && layout.w < layout.minW) {
      return "El ancho es menor al mínimo permitido";
    }
    if (layout.minH && layout.h < layout.minH) {
      return "El alto es menor al mínimo permitido";
    }
    return null;
  }
}
