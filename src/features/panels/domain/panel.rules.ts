import { Timestamp } from "firebase/firestore";
import { type Panel } from "./panel.entity";

export default class PanelRules {
  static validateName(name: string): string | null {
    if (!name || name.trim().length === 0) {
      return "El nombre del panel es requerido";
    }
    if (name.length > 50) {
      return "El nombre no puede exceder 50 caracteres";
    }
    return null;
  }

  static canDelete(panel: Panel): boolean {
    // No se puede eliminar el panel por defecto
    return !panel.isDefault;
  }

  static getDefaultPanel(): Panel {
    return {
      id: "default",
      name: "Panel Principal",
      color: "blue",
      icon: "IconHome",
      isDefault: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
  }
}
