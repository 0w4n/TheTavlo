import type { LayoutItem } from "react-grid-layout";
import type { ResponsiveLayout, WidgetType } from "./widget.entity";
export declare class WidgetRules {
    static readonly GRID_COLUMNS = 12;
    static readonly ROW_HEIGHT = 30;
    static readonly GRID_GAP = 16;
    static getDefaultLayout(type: WidgetType): ResponsiveLayout;
    static createLayoutItem(w: number, h: number): Omit<LayoutItem, "i">;
    static validateLayout(layout: Omit<LayoutItem, "i">): string | null;
}
