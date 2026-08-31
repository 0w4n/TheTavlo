import type { WidgetType } from "./widget.entity";
export interface WidgetTemplate {
    type: WidgetType;
    title: string;
    description: string;
    icon: string;
    category: "tasks" | "events" | "exams" | "productivity" | "other";
    commingSoon: boolean;
    defaultConfig: Record<string, any>;
}
export declare const WIDGET_TEMPLATES: WidgetTemplate[];
