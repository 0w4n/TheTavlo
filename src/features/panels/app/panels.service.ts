import type {
  CreatePanelDTO,
  Panel,
  UpdatePanelDTO,
} from "../domain/panel.entity";
import PanelRules from "../domain/panel.rules";
import type { PanelRepository } from "./panelsRepository.interface";

export class PanelsService {
  constructor(private repository: PanelRepository) {}

  async getAllPanels(): Promise<Panel[]> {
    const panels = await this.repository.findAll();
    console.log("Panels retrieved from repository:", panels);

    // Si no hay paneles, crear el panel por defecto
    if (panels.length === 0) {
      const defaultPanel = await this.createDefaultPanel();
      return [defaultPanel];
    }

    return panels;
  }

  async getPanelById(id: string): Promise<Panel | null> {
    return this.repository.findById(id);
  }

  async createPanel(
    data: CreatePanelDTO
  ): Promise<{ panel?: Panel; error?: string }> {
    const nameError = PanelRules.validateName(data.name);
    if (nameError) {
      return { error: nameError };
    }

    try {
      const panel = await this.repository.create(data);
      return { panel };
    } catch (error) {
      return { error: "Error al crear el panel" };
    }
  }

  async updatePanel(
    id: string,
    data: UpdatePanelDTO
  ): Promise<{ panel?: Panel; error?: string }> {
    if (data.name) {
      const nameError = PanelRules.validateName(data.name);
      if (nameError) return { error: nameError };
    }

    try {
      const panel = await this.repository.update(id, data);
      return { panel };
    } catch (error) {
      return { error: "Error al actualizar el panel" };
    }
  }

  async deletePanel(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const panel = await this.repository.findById(id);

      if (!panel) {
        return { success: false, error: "Panel no encontrado" };
      }

      if (!PanelRules.canDelete(panel)) {
        return {
          success: false,
          error: "No se puede eliminar el panel por defecto",
        };
      }

      await this.repository.delete(id);
      return { success: true };
    } catch (error) {
      return { success: false, error: "Error al eliminar el panel" };
    }
  }

  async reorderPanels(
    panelIds: string[]
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await this.repository.reorder(panelIds);
      return { success: true };
    } catch (error) {
      return { success: false, error: "Error al reordenar paneles" };
    }
  }

  async getPanelStats(panelId: string): Promise<Panel["stats"] | null> {
    try {
      return await this.repository.getStats(panelId);
    } catch (error) {
      return null;
    }
  }

  private async createDefaultPanel(): Promise<Panel> {
    // Esto es manejado por el repositorio al detectar que no hay paneles
    const panels = await this.repository.findAll();
    return panels[0];
  }
}
