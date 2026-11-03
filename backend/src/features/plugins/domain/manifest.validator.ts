import {
  asArray, asBoolean, asDefault, asEnum, asInt, asObject, asOptional, asRecord, asString, badRequest,
} from "./validators.js";

/** Permisos que un plugin puede solicitar. Añadir una capacidad = añadir aquí
 *  + un handler en el cliente (runtime/capabilities.ts). Nada más. */
export const PERMISSIONS = ["instance.storage", "notifications.toast", "db.read", "db.write"] as const;
export type PluginPermission = (typeof PERMISSIONS)[number];

export const WIDGET_CATEGORIES = ["tasks", "events", "exams", "productivity", "other"] as const;
export type WidgetCategory = (typeof WIDGET_CATEGORIES)[number];
export type PluginTier = "verified" | "community";

export const SEMVER_RE = /^\d+\.\d+\.\d+$/;
export const PLUGIN_ID_RE = /^[a-z0-9]+(?:\.[a-z0-9-]+)+$/; // "acme.pomodoro"
export const REPO_RE = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;
const WIDGET_KEY_RE = /^[a-z][a-z0-9-]{0,31}$/;

export const parseSemver = (v: unknown, field = "version") => asString(v, field, { regex: SEMVER_RE });
export const parsePluginId = (v: unknown, field = "id") => asString(v, field, { max: 64, regex: PLUGIN_ID_RE });
export const parsePermission = (v: unknown) => asEnum(v, PERMISSIONS, "permiso");

export interface LayoutItem {
  x: number; y: number; w: number; h: number;
  minW?: number; minH?: number; maxW?: number; maxH?: number;
}

export interface WidgetManifest {
  key: string;
  name: string;
  description: string;
  icon: string;
  category: WidgetCategory;
  defaultConfig: Record<string, unknown>;
  defaultLayout: Record<string, LayoutItem>;
  resizable: boolean;
  /** true → máximo 1 instancia por panel. false → N instancias independientes. */
  singleton: boolean;
}

/** Contrato `thetavlo.plugin.json` (raíz del repo del plugin). El bundle es `dist/index.html` autocontenido. */
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

export interface RegistryEntry { id: string; repo: string; tier: PluginTier }

const MAX_DEFAULT_CONFIG_BYTES = 4096;

const one = (v: unknown, field: string): 1 => (v === 1 ? 1 : badRequest(`"${field}" debe ser 1.`));
const optInt = (field: string, min: number, max: number) => (v: unknown) => asOptional(v, (x) => asInt(x, field, { min, max }));

/** Claves almacenables en Firestore (no vacías, ni `__x__`) en objetos libres del manifiesto. */
function assertStorableKeys(value: unknown, field: string, depth = 0): void {
  if (depth > 8) badRequest(`"${field}" es demasiado profundo.`);
  if (Array.isArray(value)) return value.forEach((v) => assertStorableKeys(v, field, depth + 1));
  if (value && typeof value === "object") {
    for (const [key, nested] of Object.entries(value)) {
      if (key.length === 0 || /^__.*__$/.test(key)) badRequest(`"${field}" contiene una clave reservada.`);
      assertStorableKeys(nested, field, depth + 1);
    }
  }
}

function parseLayoutItem(raw: unknown): LayoutItem {
  const o = asObject(raw, ["x", "y", "w", "h", "minW", "minH", "maxW", "maxH"], "layout");
  const item: LayoutItem = {
    x: asInt(o.x, "x", { min: 0, max: 11 }), y: asInt(o.y, "y", { min: 0, max: 1000 }),
    w: asInt(o.w, "w", { min: 1, max: 12 }), h: asInt(o.h, "h", { min: 1, max: 24 }),
  };
  const minW = optInt("minW", 1, 12)(o.minW), minH = optInt("minH", 1, 24)(o.minH);
  const maxW = optInt("maxW", 1, 12)(o.maxW), maxH = optInt("maxH", 1, 24)(o.maxH);
  if (minW !== undefined) item.minW = minW;
  if (minH !== undefined) item.minH = minH;
  if (maxW !== undefined) item.maxW = maxW;
  if (maxH !== undefined) item.maxH = maxH;
  return item;
}

function parseWidget(raw: unknown): WidgetManifest {
  const o = asObject(raw, [
    "key", "name", "description", "icon", "category", "defaultConfig", "defaultLayout", "resizable", "singleton",
  ], "widget");
  const defaultConfig = asDefault<Record<string, unknown>>(o.defaultConfig, {}, (v) => asRecord(v, "defaultConfig", (x) => x, { maxKeys: 200 }));
  if (JSON.stringify(defaultConfig).length > MAX_DEFAULT_CONFIG_BYTES) badRequest("defaultConfig demasiado grande.");
  assertStorableKeys(defaultConfig, "defaultConfig");
  const defaultLayout = asDefault<Record<string, LayoutItem>>(
    o.defaultLayout, { lg: { x: 0, y: 0, w: 3, h: 2 } },
    (v) => asRecord(v, "defaultLayout", parseLayoutItem, { maxKeys: 8, keyMax: 8 }),
  );
  assertStorableKeys(defaultLayout, "defaultLayout");
  return {
    key: asString(o.key, "key", { regex: WIDGET_KEY_RE }),
    name: asString(o.name, "name", { max: 40 }),
    description: asString(o.description, "description", { min: 0, max: 200 }),
    icon: asDefault(o.icon, "IconPuzzle", (v) => asString(v, "icon", { min: 0, max: 40 })),
    category: asDefault<WidgetCategory>(o.category, "other", (v) => asEnum(v, WIDGET_CATEGORIES, "category")),
    defaultConfig,
    defaultLayout,
    resizable: asDefault(o.resizable, true, (v) => asBoolean(v, "resizable")),
    singleton: asDefault(o.singleton, false, (v) => asBoolean(v, "singleton")),
  };
}

function parseAuthorUrl(v: unknown): string {
  const url = asString(v, "author.url", { max: 200 });
  try {
    if (/^https?:$/.test(new URL(url).protocol)) return url;
  } catch { /* cae al rechazo */ }
  return badRequest('"author.url" debe ser una URL http(s).');
}

export function parsePluginManifest(raw: unknown): PluginManifest {
  const o = asObject(raw, [
    "manifestVersion", "hostApi", "id", "name", "version", "description", "author", "license", "permissions", "widgets",
  ], "manifest");
  const author = asObject(o.author, ["name", "url"], "author");
  const url = asOptional(author.url, parseAuthorUrl);
  const widgets = asArray(o.widgets, "widgets", parseWidget, { min: 1, max: 8 });
  const keys = widgets.map((w) => w.key);
  if (new Set(keys).size !== keys.length) badRequest("widgets[].key duplicado.");
  return {
    manifestVersion: one(o.manifestVersion, "manifestVersion"),
    hostApi: one(o.hostApi, "hostApi"),
    id: parsePluginId(o.id),
    name: asString(o.name, "name", { max: 60 }),
    version: parseSemver(o.version),
    description: asString(o.description, "description", { min: 0, max: 280 }),
    author: { name: asString(author.name, "author.name", { max: 60 }), ...(url !== undefined ? { url } : {}) },
    license: asString(o.license, "license", { min: 0, max: 40 }),
    permissions: asDefault<PluginPermission[]>(
      o.permissions, [], (v) => asArray(v, "permissions", parsePermission, { max: PERMISSIONS.length }),
    ),
    widgets,
  };
}

/** Allowlist mantenida por PR en el repo `plugin-registry`. */
export function parseRegistry(raw: unknown): RegistryEntry[] {
  return asArray(raw, "registry", (item) => {
    const o = asObject(item, ["id", "repo", "tier"], "registry[]");
    return {
      id: parsePluginId(o.id),
      repo: asString(o.repo, "repo", { regex: REPO_RE }),
      tier: asEnum<PluginTier>(o.tier, ["verified", "community"], "tier"),
    };
  }, { max: 500 });
}
