import type { DocumentReference } from "firebase/firestore";
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

    // Si no hay paneles, crear el panel por defecto
    if (panels.length === 0) {
      const defaultPanel = await this.createDefaultPanel();
      return [defaultPanel];
    }

    return panels;
  }

  async getHomePanel(): Promise<Panel> {
    return this.repository.findHomePanel();
  }

  async getPanelById(id: string): Promise<Panel | undefined> {
    return this.repository.findById(id);
  }

  async getPanelByRef(ref: DocumentReference): Promise<Panel | undefined> {
    return this.repository.findByRef(ref);
  }

  async getDocRef(id: string): Promise<DocumentReference | Error> {
    return this.repository.findDocRef(id);
  }

  async createPanel(
    data: CreatePanelDTO,
    parentId: string = "root",
  ): Promise<Panel | Error> {
    const nameError = PanelRules.validateName(data.name);
    if (nameError) return Error(nameError);
    console.log(nameError);

    try {
      console.log("Try, servicePanels: ", {data, parentId});
      const panel = await this.repository.create(data, parentId);
      console.log("panelService: ", panel);

      return panel;
    } catch (error) {
      return Error("Error al crear el panel");
    }
  }

  async addSubPanel(
    parentRef: DocumentReference,
    childRef: DocumentReference,
  ): Promise<boolean | Error> {
    try {
      // 1. Añadimos el await para esperar a que el repositorio termine la operación en Firestore
      const result = await this.repository.addSubPanel(parentRef, childRef);

      // 2. Si el repositorio devolvió un Error, lo retornamos
      if (result instanceof Error) {
        return result;
      }

      return true;
    } catch (error) {
      // 3. Pasamos el objeto de error real para que la presentación sepa qué falló exactamente
      return Error(
        `Error al añadir el subPanel en el servicio: ${error instanceof Error ? error.message : error}`,
      );
    }
  }

  async updatePanel(id: string, data: UpdatePanelDTO): Promise<Panel | Error> {
    if (data.name) {
      const nameError = PanelRules.validateName(data.name);
      if (nameError) return Error(nameError);
    }

    try {
      const panel = await this.repository.update(id, data);
      return panel;
    } catch (error) {
      return Error("Error al actualizar el panel");
    }
  }

  async deletePanel(id: string): Promise<{ success: boolean; error?: Error }> {
    try {
      const panel = await this.repository.findById(id);

      if (!panel) {
        return { success: false, error: Error("Panel no encontrado") };
      }

      if (!PanelRules.canDelete(panel)) {
        return {
          success: false,
          error: Error("No se puede eliminar el panel por defecto"),
        };
      }

      await this.repository.delete(id);
      return { success: true };
    } catch (error) {
      return { success: false, error: Error("Error al eliminar el panel") };
    }
  }

  private async createDefaultPanel(): Promise<Panel> {
    // Esto es manejado por el repositorio al detectar que no hay paneles
    const panels = await this.repository.findAll();
    return panels[0];
  }
}
