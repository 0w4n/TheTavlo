import type {
  StatisticContext,
  StatisticDefinition,
  StatisticResult,
  StatisticSource,
} from "../domain/statistic.types";

/** Una estadística ya calculada, lista para pintar. */
export interface ResolvedStatistic {
  id: string;
  title: string;
  description: string;
  icon: string;
  /** `null` = "sin datos suficientes" (el plugin así lo indicó). */
  result: StatisticResult | null;
  /** `true` si el `compute` del plugin lanzó un error. */
  failed: boolean;
}

/**
 * Calcula las estadísticas pedidas de una fuente.
 *
 *  • Respeta el orden de `statisticIds` (así un widget decide su layout).
 *  • Sin `statisticIds` devuelve TODAS las de la fuente.
 *  • Un id desconocido se ignora con un warning (p. ej. una estadística que un
 *    plugin eliminó pero sigue en la config de un widget guardado).
 *  • Si el `compute` de UNA estadística falla, solo esa se marca `failed`: un
 *    plugin con un bug no tumba el resto del widget.
 */
export function resolveStatistics<TInput>(
  source: StatisticSource<TInput>,
  input: TInput,
  ctx: StatisticContext,
  statisticIds?: readonly string[],
): ResolvedStatistic[] {
  const definitions: StatisticDefinition<TInput>[] = statisticIds
    ? statisticIds.flatMap((id) => {
        const found = source.statistics.find((s) => s.id === id);
        if (!found) {
          console.warn(
            `[statistic] La fuente "${source.id}" no tiene la estadística "${id}" — se ignora.`,
          );
        }
        return found ? [found] : [];
      })
    : source.statistics;

  return definitions.map((definition) => {
    const base = {
      id: definition.id,
      title: definition.title,
      description: definition.description,
      icon: definition.icon,
    };

    try {
      return { ...base, result: definition.compute(input, ctx), failed: false };
    } catch (error) {
      console.error(`[statistic] Falló "${definition.id}":`, error);
      return { ...base, result: null, failed: true };
    }
  });
}

/** Lee `config.statisticIds` (lo que persiste el widget) de forma segura. */
export function readStatisticIds(
  config: Record<string, unknown> | undefined,
  fallback: readonly string[],
): readonly string[] {
  const value = config?.statisticIds;

  if (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every((id) => typeof id === "string")
  ) {
    return value as string[];
  }

  return fallback;
}
