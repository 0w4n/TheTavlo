// Discovery — capa de infraestructura (aquí sí vivimos con Vite).
//
// Encuentra automáticamente todos los widgets de la app sin que este
// archivo (ni ningún otro) tenga que importarlos uno por uno. La regla es
// simple: cualquier Feature que cree un archivo
//
//   src/features/{feature}/components/templates/widget/*.widget.meta.ts
//
// aparece aquí solo, sin tocar este archivo ni ningún "switch" central.
//
// ── Por qué `eager: true` NO rompe el lazy-loading ──────────────────────
// `import.meta.glob(..., { eager: true })` carga de inmediato el módulo
// *.widget.meta.ts de cada widget — pero esos archivos son solo datos
// (nombre, ícono, categoría, defaultConfig/Layout) más un `load: () =>
// import("./XWidget")`. Ese `import()` es una llamada dinámica normal:
// Vite/Rollup SIEMPRE la separa en su propio chunk, sin importar si el
// archivo que la contiene se cargó eager o no. Mientras un `.widget.meta.ts`
// jamás haga `import Algo from "./XWidget"` de forma estática (solo el
// `load()` perezoso), el componente pesado nunca se descarga por
// descubrir el widget — sólo al renderizarlo.
import { WidgetRegistry } from "../domain/widgetRegistry";
import type { WidgetDefinition } from "../domain/widgetDefinition.types";

type WidgetMetaModule = { default: WidgetDefinition };

const metaModules = import.meta.glob<WidgetMetaModule>(
  "/src/features/*/components/templates/widget/*.widget.meta.ts",
  { eager: true },
);

// La carpeta de cookingBook usa "template" (singular) en vez de
// "templates" — se busca aparte para no forzar un rename fuera de alcance.
const legacyMetaModules = import.meta.glob<WidgetMetaModule>(
  "/src/features/*/components/template/widget/*.widget.meta.ts",
  { eager: true },
);

export function discoverWidgetDefinitions(): WidgetDefinition[] {
  const definitions: WidgetDefinition[] = [];

  for (const [path, mod] of Object.entries({
    ...metaModules,
    ...legacyMetaModules,
  })) {
    const definition = mod.default;
    if (!definition || typeof definition.type !== "string" || !definition.type) {
      console.warn(
        `[widgets] "${path}" no exporta un WidgetDefinition válido (falta ` +
          `"default" o "type") — se ignora.`,
      );
      continue;
    }
    definitions.push(definition);
  }

  return definitions;
}

function buildRegistry(): WidgetRegistry {
  const registry = new WidgetRegistry();

  for (const definition of discoverWidgetDefinitions()) {
    try {
      registry.register(definition);
    } catch (error) {
      // Un widget mal configurado no debe tumbar el resto de la app.
      console.error(`[widgets] No se pudo registrar "${definition.type}":`, error);
    }
  }

  return registry;
}

/** Instancia única, poblada automáticamente al importar este módulo. */
export const widgetRegistry = buildRegistry();
