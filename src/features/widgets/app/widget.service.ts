import type { Unsubscribe } from "firebase/firestore";
import type { Widget, WidgetType } from "../domain/widget.entity";
import { WidgetRules } from "../domain/widget.rules";
import { WIDGET_TEMPLATES } from "../domain/widgetTemplates";
import type { WidgetRepository } from "./widgetRepository.interface";
import { Timestamp } from "firebase/firestore";
import type { ResponsiveLayouts } from "react-grid-layout";

export class WidgetService {
  constructor(private repository: WidgetRepository) {}

  // ─── Suscripción ─────────────────────────────────────────────────────────

  /**
   * Escucha los widgets del panel activo en tiempo real.
   * Llama a onData con la lista completa cada vez que hay un cambio.
   * Devuelve la función de limpieza — llamarla para cancelar la suscripción.
   */
  subscribeToPanel(
    onData: (widgets: Widget[]) => void,
    onError: (err: string) => void,
  ): Unsubscribe {
    return this.repository.subscribe(onData, onError);
  }

  // ─── Queries puntuales ────────────────────────────────────────────────────

  async getPanelWidgets(panelId: string): Promise<Widget[]> {
    return this.repository.findByPanel(panelId);
  }

  // ─── Mutaciones ──────────────────────────────────────────────────────────

  async addWidget(
    type: WidgetType,
  ): Promise<{ widget?: Widget; error?: unknown }> {
    const template = WIDGET_TEMPLATES.find((t) => t.type === type);
    if (!template) return { error: "Tipo de widget no encontrado" };

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
    } catch (error) {
      return { error };
    }
  }

  async updateWidgetConfig(
    widgetId: string,
    config: Record<string, any>,
  ): Promise<{ widget?: Widget; error?: string }> {
    try {
      const widget = await this.repository.update(widgetId, { config });
      return { widget };
    } catch {
      return { error: "Error al actualizar configuración" };
    }
  }

  async updateWidgetLayout(
    layouts: ResponsiveLayouts,
  ): Promise<{ success: boolean; error?: string }> {
    for (const [, items] of Object.entries(layouts)) {
      for (const item of items ?? []) {
        const error = WidgetRules.validateLayout(item);
        if (error) return { success: false, error };
      }
    }

    try {
      await this.repository.updateLayout(layouts);
      return { success: true };
    } catch {
      return { success: false, error: "Error al actualizar layouts" };
    }
  }

  async removeWidget(widgetId: string): Promise<void> {
    await this.repository.delete(widgetId);
  }
}
