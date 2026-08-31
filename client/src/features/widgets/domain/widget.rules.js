export class WidgetRules {
    static getDefaultLayout(type) {
        const defaults = {
            "task-list": {
                lg: this.createLayoutItem(3, 2),
                md: this.createLayoutItem(3, 2),
                sm: this.createLayoutItem(2, 1),
                xs: this.createLayoutItem(2, 1),
                xxs: this.createLayoutItem(1, 2),
            },
            "panels-list": {
                lg: this.createLayoutItem(3, 2),
                md: this.createLayoutItem(3, 2),
                sm: this.createLayoutItem(2, 4),
                xs: this.createLayoutItem(2, 4),
                xxs: this.createLayoutItem(1, 2),
            },
            "event-calendar": { lg: { x: 0, y: 0, w: 8, h: 5 } }, // w: 8, h: 5
            "event-list": { lg: { x: 0, y: 0, w: 4, h: 4 } }, // w: 4, h: 4
            "exam-timeline": {
                lg: this.createLayoutItem(3, 2),
                md: this.createLayoutItem(3, 2),
                sm: this.createLayoutItem(2, 1),
                xs: this.createLayoutItem(2, 1),
                xxs: this.createLayoutItem(1, 2),
            },
            "exam-countdown": {
                lg: this.createLayoutItem(3, 2),
                md: this.createLayoutItem(3, 2),
                sm: this.createLayoutItem(2, 1),
                xs: this.createLayoutItem(2, 1),
                xxs: this.createLayoutItem(1, 2),
            },
            statistics: { lg: { x: 0, y: 0, w: 4, h: 3 } }, // w: 4, h: 3
            "quick-add": { lg: { x: 0, y: 0, w: 4, h: 2 } }, // w: 4, h: 2
            "recent-activity": { lg: { x: 0, y: 0, w: 4, h: 4 } }, //
            "upcoming-deadlines": { lg: { x: 0, y: 0, w: 4, h: 3 } }, //
            "productivity-chart": { lg: { x: 0, y: 0, w: 6, h: 4 } }, //
            notes: { lg: { x: 0, y: 0, w: 4, h: 4 } }, //
            "cooking-book": {
                lg: this.createLayoutItem(3, 2),
                md: this.createLayoutItem(3, 2),
                sm: this.createLayoutItem(2, 1),
                xs: this.createLayoutItem(2, 1),
                xxs: this.createLayoutItem(1, 2),
            }, //
            custom: { lg: { x: 0, y: 0, w: 4, h: 3 } }, //
        };
        return defaults[type];
    }
    static createLayoutItem(w, h) {
        return { x: 0, y: 0, w, h };
    }
    static validateLayout(layout) {
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
Object.defineProperty(WidgetRules, "GRID_COLUMNS", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: 12
});
Object.defineProperty(WidgetRules, "ROW_HEIGHT", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: 30
}); // pixels
Object.defineProperty(WidgetRules, "GRID_GAP", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: 16
}); // pixels
