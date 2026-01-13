import { doc, Timestamp, writeBatch } from "firebase/firestore";
import type { Widget, WidgetType, WidgetLayout } from "../domain/widget.entity";
import { WidgetRules } from "../domain/widget.rules";
import { WIDGET_TEMPLATES } from "../domain/widgetTemplates";
import type { WidgetRepository } from "./widgetRepository.interface";
import { firebaseService } from "#shared/infraestructure/firebase/firebaseConfig";

export class WidgetService {
  constructor(private repository: WidgetRepository) {}

  async getPanelWidgets(panelId: string): Promise<Widget[]> {
    return this.repository.findByPanel(panelId);
  }

  async addWidget(
    type: WidgetType,
    customLayout?: Partial<WidgetLayout>
  ): Promise<{ widget?: Widget; error?: string }> {
    const template = WIDGET_TEMPLATES.find((t) => t.type === type);
    if (!template) {
      return { error: "Tipo de widget no encontrado" };
    }

    const layout = WidgetRules.getDefaultLayout(type);

    const layoutError = WidgetRules.validateLayout(layout);
    if (layoutError) {
      return { error: layoutError };
    }

    try {
      const widget = await this.repository.create({
        type,
        title: template.title,
        layout,
        config: template.defaultConfig,
        locked: false,
        isHome: true,
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
    config: Record<string, any>
  ): Promise<{ widget?: Widget; error?: string }> {
    try {
      const widget = await this.repository.update(widgetId, {
        config,
      });
      return { widget };
    } catch (error) {
      return { error: "Error al actualizar configuración" };
    }
  }

  async updateWidgetLayouts(
    updates: Array<{ id: string; layout: WidgetLayout }>
  ): Promise<{ success: boolean; error?: string }> {
    // Validar todos los layouts
    for (const update of updates) {
      const error = WidgetRules.validateLayout(update.layout);
      if (error) {
        return { success: false, error };
      }
    }

    try {
      await this.repository.updateBulkLayouts(updates);
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

  async compactWidgets(
    panelId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const widgets = await this.repository.findByPanel(panelId);
      const compacted = WidgetRules.compactLayout(widgets);

      const updates = compacted.map((w) => ({
        id: w.id,
        layout: w.layout,
        panelId,
      }));

      await this.repository.updateBulkLayouts(updates);
      return { success: true };
    } catch (error) {
      return { success: false, error: "Error al compactar widgets" };
    }
  }

   async removeWidget(
    userId: string,
    panelId: string,
    widgetId: string
  ): Promise<void> {
    const db = firebaseService.firestore;
    const batch = writeBatch(db);

    const panelRef = doc(db, "users", userId, "panels", panelId);
    const widgetRef = doc(
      db,
      "users",
      userId,
      "panels",
      panelId,
      "widgets",
      widgetId
    );

    batch.update(panelRef, {
      updatedAt: Timestamp.now(),
    });

    batch.delete(widgetRef);

    await batch.commit();
  }
}
