import type { Unsubscribe } from "firebase/firestore";
import type { Widget, WidgetType } from "../domain/widget.entity";
import type { WidgetRepository } from "./widgetRepository.interface";
import type { ResponsiveLayouts } from "react-grid-layout";
export declare class WidgetService {
    private repository;
    constructor(repository: WidgetRepository);
    /**
     * Escucha los widgets del panel activo en tiempo real.
     * Llama a onData con la lista completa cada vez que hay un cambio.
     * Devuelve la función de limpieza — llamarla para cancelar la suscripción.
     */
    subscribeToPanel(onData: (widgets: Widget[]) => void, onError: (err: string) => void): Unsubscribe;
    getPanelWidgets(panelId: string): Promise<Widget[]>;
    addWidget(type: WidgetType): Promise<{
        widget?: Widget;
        error?: unknown;
    }>;
    updateWidgetConfig(widgetId: string, config: Record<string, any>): Promise<{
        widget?: Widget;
        error?: string;
    }>;
    updateWidgetLayout(layouts: ResponsiveLayouts): Promise<{
        success: boolean;
        error?: string;
    }>;
    removeWidget(widgetId: string): Promise<void>;
}
