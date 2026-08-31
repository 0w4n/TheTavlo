import type { WidgetService } from "../../app/widget.service";
import type { Widget, WidgetType } from "#features/widgets/domain/widget.entity";
import { type PropsWithChildren } from "react";
import type { ResponsiveLayouts } from "react-grid-layout";
import { type WidgetsState } from "./widgetReducer";
type WidgetsContextValue = {
    state: WidgetsState;
    fetchWidgets: (panelId: string) => Promise<void>;
    addWidget: (type: WidgetType) => Promise<Widget>;
    updateWidgetConfig: (widgetId: string, config: Record<string, any>) => Promise<void>;
    updateLayout: (layout: ResponsiveLayouts) => Promise<void>;
    removeWidget: (widgetId: string) => Promise<void>;
    toggleEditMode: () => void;
    clearError: () => void;
};
export declare const WidgetsContext: import("react").Context<WidgetsContextValue | undefined>;
export declare function WidgetsProvider({ children, widgetService, }: PropsWithChildren<{
    widgetService: WidgetService;
}>): import("react").JSX.Element;
export {};
