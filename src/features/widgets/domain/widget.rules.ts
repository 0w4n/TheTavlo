import type { Widget, WidgetLayout, WidgetType } from "./widget.entity";

export class WidgetRules {
  static readonly GRID_COLUMNS = 12;
  static readonly ROW_HEIGHT = 80; // pixels
  static readonly GRID_GAP = 16; // pixels

  static getDefaultLayout(type: WidgetType): WidgetLayout {
    const defaults: Record<WidgetType, WidgetLayout> = {
      "task-list": { x: 0, y: 0, w: 6, h: 4, minW: 3, minH: 3 },
      "panels-list": { x: 0, y: 0, w: 6, h: 4, minW: 3, minH: 3 },
      "event-calendar": { x: 0, y: 0, w: 8, h: 5, minW: 6, minH: 4 },
      "event-list": { x: 0, y: 0, w: 4, h: 4, minW: 3, minH: 3 },
      "exam-timeline": { x: 0, y: 0, w: 12, h: 3, minW: 6, minH: 2 },
      "exam-countdown": {
        x: 0,
        y: 0,
        w: 3,
        h: 2,
        minW: 2,
        minH: 2,
        maxW: 4,
        maxH: 3,
      },
      statistics: { x: 0, y: 0, w: 4, h: 3, minW: 3, minH: 2 },
      "quick-add": { x: 0, y: 0, w: 4, h: 2, minW: 3, minH: 2, maxH: 3 },
      "recent-activity": { x: 0, y: 0, w: 4, h: 4, minW: 3, minH: 3 },
      "upcoming-deadlines": { x: 0, y: 0, w: 4, h: 3, minW: 3, minH: 2 },
      "productivity-chart": { x: 0, y: 0, w: 6, h: 4, minW: 4, minH: 3 },
      notes: { x: 0, y: 0, w: 4, h: 4, minW: 3, minH: 3 },
      custom: { x: 0, y: 0, w: 4, h: 3, minW: 2, minH: 2 },
    };
    return defaults[type];
  }

  static validateLayout(layout: WidgetLayout): string | null {
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
    newWidgetLayout: WidgetLayout
  ): WidgetLayout {
    // Algoritmo simple: buscar la primera posición disponible
    let y = 0;
    let found = false;

    while (!found && y < 100) {
      // Límite de seguridad
      for (let x = 0; x <= this.GRID_COLUMNS - newWidgetLayout.w; x++) {
        const testLayout = { ...newWidgetLayout, x, y };
        if (!this.hasCollision(testLayout, existingWidgets)) {
          return testLayout;
        }
      }
      y++;
    }

    // Si no encuentra espacio, colocar al final
    const maxY = Math.max(
      ...existingWidgets.map((w) => w.layout.y + w.layout.h),
      0
    );
    return { ...newWidgetLayout, x: 0, y: maxY };
  }

  static hasCollision(layout: WidgetLayout, widgets: Widget[]): boolean {
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
