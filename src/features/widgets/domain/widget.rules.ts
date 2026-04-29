import type { LayoutItem } from "react-grid-layout";
import type { ResponsiveLayout, Widget, WidgetType } from "./widget.entity";

export class WidgetRules {
  static readonly GRID_COLUMNS = 12;
  static readonly ROW_HEIGHT = 30; // pixels
  static readonly GRID_GAP = 16; // pixels

  static getDefaultLayout(type: WidgetType): ResponsiveLayout {
    const defaults: Record<WidgetType, ResponsiveLayout> = {
      "task-list": {
        lg: this.createLayoutItem(2, 4),
        md: this.createLayoutItem(3, 2),
        sm: this.createLayoutItem(2, 1),
      },
      "panels-list": {
        lg: this.createLayoutItem(2, 4),
        md: this.createLayoutItem(2, 4),
        sm: this.createLayoutItem(2, 4),
        xs: this.createLayoutItem(2, 4),
        xxs: this.createLayoutItem(2, 4),
      },
      "event-calendar": { lg: { x: 0, y: 0, w: 8, h: 5 } }, // w: 8, h: 5
      "event-list": { lg: { x: 0, y: 0, w: 4, h: 4 } }, // w: 4, h: 4
      "exam-timeline": { lg: { x: 0, y: 0, w: 12, h: 3 } }, // w: 12, h: 3
      "exam-countdown": { lg: { x: 0, y: 0, w: 3, h: 2 } }, // w: 3, h: 2
      statistics: { lg: { x: 0, y: 0, w: 4, h: 3 } }, // w: 4, h: 3
      "quick-add": { lg: { x: 0, y: 0, w: 4, h: 2 } }, // w: 4, h: 2
      "recent-activity": { lg: { x: 0, y: 0, w: 4, h: 4 } }, //
      "upcoming-deadlines": { lg: { x: 0, y: 0, w: 4, h: 3 } }, //
      "productivity-chart": { lg: { x: 0, y: 0, w: 6, h: 4 } }, //
      notes: { lg: { x: 0, y: 0, w: 4, h: 4 } }, //
      custom: { lg: { x: 0, y: 0, w: 4, h: 3 } }, //
    };

    return defaults[type];
  }

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

  static findNextAvailablePosition(
    existingWidgets: Widget[],
    newLayout: LayoutItem,
  ): LayoutItem {
    // Algoritmo simple: buscar la primera posición disponible
    let y = 0;
    let found = false;

    while (!found && y < 100) {
      // Límite de seguridad
      for (let x = 0; x <= this.GRID_COLUMNS - newLayout.w; x++) {
        const testLayout = { ...newLayout, x, y };
        if (!this.hasCollision(testLayout, existingWidgets)) {
          return testLayout;
        }
      }
      y++;
    }

    // Si no encuentra espacio, colocar al final
    const maxY = Math.max(
      ...existingWidgets.map((w) => w.layout.y + w.layout.h),
      0,
    );
    return { ...newLayout, x: 0, y: maxY };
  }

  static hasCollision(layout: LayoutItem, widgets: Widget[]): boolean {
    return widgets.some((widget) => {
      const w = widget.layout;
      return !(
        layout.x + layout.w <= w.x ||
        layout.x >= w.x + w.w ||
        layout.y + layout.h <= w.y ||
        layout.y >= w.y + w.h
      );
    });
  }

  static compactLayout(widgets: Widget[]): Widget[] {
    // Ordenar por posición Y, luego X
    const sorted = [...widgets].sort((a, b) => {
      if (a.layout.y !== b.layout.y) return a.layout.y - b.layout.y;
      return a.layout.x - b.layout.x;
    });

    const compacted = sorted.map((widget) => {
      let newY = 0;
      const newLayout = { ...widget.layout };

      // Buscar la posición Y más alta posible
      while (newY < widget.layout.y) {
        const testLayout = { ...newLayout, y: newY };
        const otherWidgets = sorted.filter((w) => w.id !== widget.id);

        if (!this.hasCollision(testLayout, otherWidgets)) {
          newLayout.y = newY;
          break;
        }
        newY++;
      }

      return { ...widget, layout: newLayout };
    });

    return compacted;
  }
}
