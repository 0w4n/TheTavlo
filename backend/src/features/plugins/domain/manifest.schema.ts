/** Permisos que un plugin puede solicitar. Añadir una capacidad = añadir aquí
 *  + un handler en el cliente (runtime/capabilities.ts). Nada más. */
export const PERMISSIONS = ["instance.storage", "notifications.toast"] as const;
export type PluginPermission = (typeof PERMISSIONS)[number];

// --- Tipos puros en TypeScript (equivalentes a los schemas de Zod) ---

export type Semver = string; //^\d+\.\d+\.\d+$
export type PluginId = string; //^[a-z0-9]+(?:\.[a-z0-9-]+)+$

export interface LayoutItem {
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
}

export type WidgetCategory = "tasks" | "events" | "exams" | "productivity" | "other";

export interface Widget {
  key: string;
  name: string;
  description: string;
  icon?: string;
  category?: WidgetCategory;
  defaultConfig?: Record<string, unknown>;
  defaultLayout?: Record<string, LayoutItem>;
  resizable?: boolean;
  /** true → máximo 1 instancia por panel. false → N instancias independientes. */
  singleton?: boolean;
}

export interface PluginAuthor {
  name: string;
  url?: string;
}

/**
 * Contrato `thetavlo.plugin.json` (raíz del repo del plugin).
 * El bundle SIEMPRE es `dist/index.html` autocontenido (JS/CSS/assets inline).
 */
export interface PluginManifest {
  manifestVersion: 1;
  hostApi: 1;
  id: PluginId;
  name: string;
  version: Semver;
  description: string;
  author: PluginAuthor;
  license: string;
  permissions?: PluginPermission[];
  widgets: Widget[];
}

/** Allowlist mantenida por PR en el repo `plugin-registry`. */
export interface RegistryEntry {
  id: PluginId;
  repo: string;
  tier: "verified" | "community";
}

export type Registry = RegistryEntry[];


// --- Función opcional de validación en runtime (si necesitas validar objetos al cargarlos) ---

export function validatePluginManifest(data: unknown): asserts data is PluginManifest {
  // Aquí puedes añadir validaciones lógicas si las necesitas en runtime 
  // (ej. chequear duplicados en widgets como hacía superRefine):
  const manifest = data as PluginManifest;
  if (manifest && Array.isArray(manifest.widgets)) {
    const keys = manifest.widgets.map((w) => w.key);
    if (new Set(keys).size !== keys.length) {
      throw new Error("widgets[].key duplicado");
    }
  }
}