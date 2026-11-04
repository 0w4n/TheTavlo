// Discovery — capa de infraestructura (aquí sí vivimos con Vite).
//
// Encuentra automáticamente todos los widgets. La regla: cualquier Feature
// que cree un archivo
//
//   src/features/{feature}/**/*.widget.meta.ts
//
// con `export default <WidgetDefinition>` aparece sola en `widgetRegistry`,
// sin tocar este archivo ni ningún switch central.
//
// `eager: true` es correcto: el archivo `.widget.meta.ts` es liviano (solo
// metadata + thunks `load()`); el componente pesado sigue en lazy porque
// únicamente se referencia vía `import()` dentro de `load`.
import { WidgetRegistry } from "../domain/widgetRegistry";
import type { WidgetDefinition } from "../domain/widgetDefinition.types";

type WidgetMetaModule = { default: WidgetDefinition };

const metaModules = import.meta.glob<WidgetMetaModule>(
  "/src/features/**/*.widget.meta.ts",
  { eager: true },
);

/** Lee todos los `*.widget.meta.ts` y devuelve solo las definiciones válidas. */
export function discoverWidgetDefinitions(): WidgetDefinition[] {
  const definitions: WidgetDefinition[] = [];

  for (const [path, mod] of Object.entries(metaModules)) {
    const definition = mod.default;
    if (
      !definition ||
      typeof definition.type !== "string" ||
      !definition.type ||
      !definition.metadata ||
      typeof definition.load !== "function"
    ) {
      console.warn(
        `[widgets] "${path}" no exporta una WidgetDefinition válida (falta ` +
          `"default", "type", "metadata" o "load") — se ignora.`,
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
      // Un widget mal configurado (p. ej. type duplicado) no debe tumbar al resto.
      console.error(`[widgets] No se pudo registrar "${definition.type}":`, error);
    }
  }

  return registry;
}

/** Instancia única, poblada automáticamente al importar este módulo. */
export const widgetRegistry = buildRegistry();

export { WidgetRegistry, DuplicateWidgetTypeError } from "../domain/widgetRegistry";