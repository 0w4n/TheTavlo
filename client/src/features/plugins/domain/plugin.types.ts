// Espejo de backend/src/features/plugins/domain (hoy client y backend no comparten paquete).
// Recomendado: extraer a un paquete de workspace `@thetavlo/plugin-contract`.

export type PluginPermission = "instance.storage" | "notifications.toast";

export interface WidgetManifest {
  key: string;
  name: string;
  description: string;
  icon: string;
  category: "tasks" | "events" | "exams" | "productivity" | "other";
  defaultConfig: Record<string, unknown>;
  defaultLayout: Record<string, { x: number; y: number; w: number; h: number; minW?: number; minH?: number; maxW?: number; maxH?: number }>;
  resizable: boolean;
  singleton: boolean;
}

export interface PluginManifest {
  manifestVersion: 1;
  hostApi: 1;
  id: string;
  name: string;
  version: string;
  description: string;
  author: { name: string; url?: string };
  license: string;
  permissions: PluginPermission[];
  widgets: WidgetManifest[];
}

export interface ResolvedPlugin {
  pluginId: string;
  version: string;
  manifest: PluginManifest;
  bundleUrl: string;
  integrity: string;
  permissions: PluginPermission[];
}

export interface PanelScope {
  ownerId: string;
  ownerAccountType: "users" | "guests";
  panelId: string;
}

/** Una instancia = un widget de panel cuyo `type` es `plugin:<id>/<key>`. */
export interface PluginInstanceRef {
  instanceId: string; // = widgetId (único por instancia → aísla estado y canal)
  pluginId: string;
  widgetKey: string;
  config: Record<string, unknown>;
}
