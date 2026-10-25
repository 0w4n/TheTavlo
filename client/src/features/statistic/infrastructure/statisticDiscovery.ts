// Discovery — capa de infraestructura (aquí sí vivimos con Vite).
//
// Encuentra automáticamente a todos los "plugins" de estadísticas. La regla:
// cualquier Feature que cree un archivo
//
//   src/features/{feature}/statistics/*.statistic.source.ts
//
// con `export default defineStatisticSource({...})` aparece aquí sola, sin
// tocar este archivo ni ningún switch central. Mismo patrón que
// `widgetDiscovery.ts`.
//
// `eager: true` es correcto: a diferencia de un widget, una fuente es liviana
// (funciones puras + un hook) y el host necesita conocer sus estadísticas para
// resolver los widgets. Lo pesado de cada widget sigue cargándose en lazy.
import { StatisticRegistry } from "../domain/statisticRegistry";
import type { StatisticSource } from "../domain/statistic.types";

type StatisticSourceModule = { default: StatisticSource };

const sourceModules = import.meta.glob<StatisticSourceModule>(
  "/src/features/*/statistics/*.statistic.source.ts",
  { eager: true },
);

export function discoverStatisticSources(): StatisticSource[] {
  const sources: StatisticSource[] = [];

  for (const [path, mod] of Object.entries(sourceModules)) {
    const source = mod.default;
    if (
      !source ||
      typeof source.id !== "string" ||
      !source.id ||
      typeof source.useInput !== "function" ||
      !Array.isArray(source.statistics)
    ) {
      console.warn(
        `[statistic] "${path}" no exporta una StatisticSource válida (falta ` +
          `"default", "id", "useInput" o "statistics") — se ignora.`,
      );
      continue;
    }
    sources.push(source);
  }

  return sources;
}

function buildRegistry(): StatisticRegistry {
  const registry = new StatisticRegistry();

  for (const source of discoverStatisticSources()) {
    try {
      registry.register(source);
    } catch (error) {
      // Un plugin mal configurado no debe tumbar al resto.
      console.error(`[statistic] No se pudo registrar "${source.id}":`, error);
    }
  }

  return registry;
}

/** Instancia única, poblada automáticamente al importar este módulo. */
export const statisticRegistry = buildRegistry();
