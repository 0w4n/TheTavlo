import type { PluginPermission } from "../../domain/plugin.types";

export interface MarketplaceListing {
  id: string;
  name: string;
  description: string;
  author: string;
  tier: "verified" | "community";
  version: string;
  permissions: PluginPermission[];
  widgetCount: number;
  installedVersion: string | null;
}

export const PERMISSION_LABELS: Record<PluginPermission, string> = {
  "instance.storage": "Guardar sus propios datos en cada panel donde lo uses",
  "notifications.toast": "Mostrar avisos breves dentro de la aplicación",
  "db.read": "Leer los documentos que él mismo guarda (solo sus datos, nunca los de otros plugins)",
  "db.write": "Crear, modificar y borrar los documentos que él mismo guarda (con un límite de 1000 documentos)",
};
