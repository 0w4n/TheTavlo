import { z } from "zod";

/** Permisos que un plugin puede solicitar. Añadir una capacidad = añadir aquí
 *  + un handler en el cliente (runtime/capabilities.ts). Nada más. */
export const PERMISSIONS = ["instance.storage", "notifications.toast"] as const;
export type PluginPermission = (typeof PERMISSIONS)[number];

export const semverSchema = z.string().regex(/^\d+\.\d+\.\d+$/);
export const pluginIdSchema = z.string().max(64).regex(/^[a-z0-9]+(?:\.[a-z0-9-]+)+$/); // "acme.pomodoro"

const layoutItem = z.object({
  x: z.number().int().min(0).max(11),
  y: z.number().int().min(0).max(1000),
  w: z.number().int().min(1).max(12),
  h: z.number().int().min(1).max(24),
  minW: z.number().int().min(1).max(12).optional(),
  minH: z.number().int().min(1).max(24).optional(),
  maxW: z.number().int().min(1).max(12).optional(),
  maxH: z.number().int().min(1).max(24).optional(),
}).strict();

const widgetSchema = z.object({
  key: z.string().regex(/^[a-z][a-z0-9-]{0,31}$/),
  name: z.string().min(1).max(40),
  description: z.string().max(200),
  icon: z.string().max(40).default("IconPuzzle"),
  category: z.enum(["tasks", "events", "exams", "productivity", "other"]).default("other"),
  defaultConfig: z.record(z.string(), z.unknown())
    .refine((c) => JSON.stringify(c).length <= 4096, "defaultConfig demasiado grande")
    .default({}),
  defaultLayout: z.record(z.string().max(8), layoutItem).default({ lg: { x: 0, y: 0, w: 3, h: 2 } }),
  resizable: z.boolean().default(true),
  /** true → máximo 1 instancia por panel. false → N instancias independientes. */
  singleton: z.boolean().default(false),
}).strict();

/**
 * Contrato `thetavlo.plugin.json` (raíz del repo del plugin).
 * El bundle SIEMPRE es `dist/index.html` autocontenido (JS/CSS/assets inline).
 */
export const pluginManifestSchema = z.object({
  manifestVersion: z.literal(1),
  hostApi: z.literal(1), // versión del protocolo host<->plugin que implementa
  id: pluginIdSchema,
  name: z.string().min(1).max(60),
  version: semverSchema,
  description: z.string().max(280),
  author: z.object({ name: z.string().min(1).max(60), url: z.string().url().max(200).optional() }).strict(),
  license: z.string().max(40),
  permissions: z.array(z.enum(PERMISSIONS)).max(PERMISSIONS.length).default([]),
  widgets: z.array(widgetSchema).min(1).max(8),
}).strict().superRefine((m, ctx) => {
  const keys = m.widgets.map((w) => w.key);
  if (new Set(keys).size !== keys.length) {
    ctx.addIssue({ code: "custom", message: "widgets[].key duplicado", path: ["widgets"] });
  }
});

export type PluginManifest = z.infer<typeof pluginManifestSchema>;

/** Allowlist mantenida por PR en el repo `plugin-registry`. */
export const registrySchema = z.array(z.object({
  id: pluginIdSchema,
  repo: z.string().regex(/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/),
  tier: z.enum(["verified", "community"]),
}).strict()).max(500);
