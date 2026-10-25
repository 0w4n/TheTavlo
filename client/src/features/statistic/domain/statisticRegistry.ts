import type {
  StatisticDefinition,
  StatisticSource,
} from "./statistic.types";

/** Se lanza al registrar dos fuentes con el mismo `id`. */
export class DuplicateStatisticSourceError extends Error {
  constructor(id: string) {
    super(
      `La fuente de estadísticas "${id}" ya está registrada. Cada "id" debe ` +
        `ser único — revisa los archivos *.statistic.source.ts de las Features.`,
    );
    this.name = "DuplicateStatisticSourceError";
  }
}

/** Se lanza si dos estadísticas (de la misma o de distintas fuentes) repiten `id`. */
export class DuplicateStatisticIdError extends Error {
  constructor(id: string, sourceId: string) {
    super(
      `La estadística "${id}" (fuente "${sourceId}") repite un id ya ` +
        `registrado. Los ids de estadística deben ser únicos en toda la app.`,
    );
    this.name = "DuplicateStatisticIdError";
  }
}

/**
 * Registro de fuentes ("plugins") de estadísticas. No conoce ninguna fuente
 * concreta: guarda lo que el discovery (o un test) le registre. Sin React ni
 * Vite — 100 % testeable en aislamiento, igual que `WidgetRegistry`.
 */
export class StatisticRegistry {
  private readonly sources = new Map<string, StatisticSource>();
  private readonly statisticIndex = new Map<string, string>(); // statId → sourceId

  register(source: StatisticSource): void {
    if (this.sources.has(source.id)) {
      throw new DuplicateStatisticSourceError(source.id);
    }

    // Se valida ANTES de mutar nada: o entra la fuente completa o no entra.
    const seen = new Set<string>();
    for (const statistic of source.statistics) {
      if (this.statisticIndex.has(statistic.id) || seen.has(statistic.id)) {
        throw new DuplicateStatisticIdError(statistic.id, source.id);
      }
      seen.add(statistic.id);
    }

    this.sources.set(source.id, source);
    for (const id of seen) this.statisticIndex.set(id, source.id);
  }

  get(sourceId: string): StatisticSource | undefined {
    return this.sources.get(sourceId);
  }

  has(sourceId: string): boolean {
    return this.sources.has(sourceId);
  }

  getAll(): StatisticSource[] {
    return Array.from(this.sources.values());
  }

  /** Busca una estadística por id en cualquier fuente. */
  findStatistic(
    statisticId: string,
  ): { source: StatisticSource; definition: StatisticDefinition } | undefined {
    const sourceId = this.statisticIndex.get(statisticId);
    if (!sourceId) return undefined;

    const source = this.sources.get(sourceId);
    const definition = source?.statistics.find((s) => s.id === statisticId);

    return source && definition ? { source, definition } : undefined;
  }
}
