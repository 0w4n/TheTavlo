import type { Widget, WidgetType } from "../domain/widget.entity";
import { WidgetRules } from "../domain/widget.rules";
import { WIDGET_TEMPLATES } from "../domain/widgetTemplates";
import type { WidgetRepository } from "./widgetRepository.interface";
import { Timestamp } from "firebase/firestore";
import type { ResponsiveLayouts } from "react-grid-layout";

export class WidgetService {
  constructor(private repository: WidgetRepository) {}

  async getPanelWidgets(panelId: string): Promise<Widget[]> {
    return this.repository.findByPanel(panelId);
  }

  async addWidget(
    type: WidgetType,
  ): Promise<{ widget?: Widget; error?: string }> {
    const template = WIDGET_TEMPLATES.find((t) => t.type === type);
    if (!template) {
      return { error: "Tipo de widget no encontrado" };
    }

    const layout = WidgetRules.getDefaultLayout(type);

    try {
      const widget = await this.repository.create({
        type,
        layout,
        config: template.defaultConfig,
        locked: false,
        isHome: template.isHome,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      return { widget };
    } catch (error) {
      console.error(error);
      return { error: "Error al crear el widget" };
    }
  }

  async updateWidgetConfig(
    widgetId: string,
    config: Record<string, any>,
  ): Promise<{ widget?: Widget; error?: string }> {
    try {
      const widget = await this.repository.update(widgetId, { config });
      return { widget };
    } catch (error) {
      return { error: "Error al actualizar configuración" };
    }
  }

  async updateWidgetLayout(
    layouts: ResponsiveLayouts,
  ): Promise<{ success: boolean; error?: string }> {
    for (const [_, items] of Object.entries(layouts)) {
      for (const item of items ?? []) {
        const error = WidgetRules.validateLayout(item);
        if (error) {
          console.error("Layout validation error:", error);
          return { success: false, error };
        }
      }
    }

    try {
      await this.repository.updateLayout(layouts);
      return { success: true };
    } catch (error) {
      return { success: false, error: "Error al actualizar layouts" };
    }
  }

  async toggleWidgetLock(
    panelId: string,
    widgetId: string,
  ): Promise<{ widget?: Widget; error?: string }> {
    try {
      const widgets = await this.repository.findByPanel(panelId);
      const widget = widgets.find((w) => w.id === widgetId);

      if (!widget) {
        return { error: "Widget no encontrado" };
      }

      const updated = await this.repository.update(widgetId, {
        locked: !widget.locked,
      });

      return { widget: updated };
    } catch (error) {
      return { error: "Error al bloquear/desbloquear" };
    }
  }

  async removeWidget(
    widgetId: string,
  ): Promise<void> {
    await this.repository.delete(widgetId);
  }
}
