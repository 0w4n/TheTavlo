export default function useWidgets(): {
    state: import("../context/widgetReducer").WidgetsState;
    fetchWidgets: (panelId: string) => Promise<void>;
    addWidget: (type: import("../../domain/widget.entity").WidgetType) => Promise<import("../../domain/widget.entity").Widget>;
    updateWidgetConfig: (widgetId: string, config: Record<string, any>) => Promise<void>;
    updateLayout: (layout: import("react-grid-layout").ResponsiveLayouts) => Promise<void>;
    removeWidget: (widgetId: string) => Promise<void>;
    toggleEditMode: () => void;
    clearError: () => void;
};
