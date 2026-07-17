import { Timestamp } from "firebase/firestore";
import { type CreatePanelDTO, type Panel } from "./panel.entity";

export default class PanelRules {
  static validateName(name: string): string | null {
    if (!name || name.trim().length === 0) {
      return "El nombre del panel es requerido";
    }

    if (name.length > 15) {
      return "El nombre no puede exceder 50 caracteres";
    }

    return null;
  }

  static canDelete(panel: Panel): boolean {
    // No se puede eliminar el panel por defecto
    if (
      panel.color == -1 &&
      panel.icon == "" &&
      panel.name == "" &&
      panel.sharedWith == undefined
    ) {
      return false;
    } else {
      return true;
    }
  }

  static getDefaultPanel(): CreatePanelDTO {
    return {
      parentId: null,
      name: "",
      color: -1,
      icon: "",
      sharedWith: null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
  }
}
