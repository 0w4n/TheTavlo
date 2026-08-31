import { WidgetRules } from "../domain/widget.rules";
import { WIDGET_TEMPLATES } from "../domain/widgetTemplates";
import { Timestamp } from "firebase/firestore";
export class WidgetService {
    constructor(repository) {
        Object.defineProperty(this, "repository", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: repository
        });
    }
    // ─── Suscripción ─────────────────────────────────────────────────────────
    /**
     * Escucha los widgets del panel activo en tiempo real.
     * Llama a onData con la lista completa cada vez que hay un cambio.
     * Devuelve la función de limpieza — llamarla para cancelar la suscripción.
     */
    subscribeToPanel(onData, onError) {
        return this.repository.subscribe(onData, onError);
    }
    // ─── Queries puntuales ────────────────────────────────────────────────────
    async getPanelWidgets(panelId) {
        return this.repository.findByPanel(panelId);
    }
    // ─── Mutaciones ──────────────────────────────────────────────────────────
    async addWidget(type) {
        const template = WIDGET_TEMPLATES.find((t) => t.type === type);
        if (!template)
            return { error: "Tipo de widget no encontrado" };
        const layout = WidgetRules.getDefaultLayout(type);
        try {
            const widget = await this.repository.create({
                type,
                layout,
                config: template.defaultConfig,
                locked: false,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
            });
            return { widget };
        }
        catch (error) {
            return { error };
        }
    }
    async updateWidgetConfig(widgetId, config) {
        try {
            const widget = await this.repository.update(widgetId, { config });
            return { widget };
        }
        catch {
            return { error: "Error al actualizar configuración" };
        }
    }
    async updateWidgetLayout(layouts) {
        for (const [, items] of Object.entries(layouts)) {
            for (const item of items ?? []) {
                const error = WidgetRules.validateLayout(item);
                if (error)
                    return { success: false, error };
            }
        }
        try {
            await this.repository.updateLayout(layouts);
            return { success: true };
        }
        catch {
            return { success: false, error: "Error al actualizar layouts" };
        }
    }
    async removeWidget(widgetId) {
        await this.repository.delete(widgetId);
    }
}
