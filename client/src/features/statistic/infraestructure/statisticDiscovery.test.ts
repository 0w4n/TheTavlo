import { describe, expect, it } from "vitest";
import { discoverStatisticSources, statisticRegistry } from "./statisticDiscovery";

// Corre contra el discovery REAL (import.meta.glob sobre el proyecto): si
// mañana alguien agrega `features/events/statistics/events.statistic.source.ts`
// este test sigue pasando y la fuente nueva aparece sola en el registro.

describe("statisticDiscovery", () => {
  it("encuentra automáticamente el plugin de tareas", () => {
    const ids = discoverStatisticSources().map((s) => s.id);

    expect(ids).toContain("tasks");
    expect(statisticRegistry.has("tasks")).toBe(true);
  });

  it("no hay dos fuentes con el mismo id (el registro no tuvo que descartar nada)", () => {
    const discovered = discoverStatisticSources();

    expect(statisticRegistry.getAll()).toHaveLength(discovered.length);
  });

  it("cada fuente descubierta es válida y sus estadísticas están indexadas", () => {
    for (const source of statisticRegistry.getAll()) {
      expect(source.label).toBeTruthy();
      expect(typeof source.useInput).toBe("function");
      expect(source.statistics.length).toBeGreaterThan(0);

      for (const statistic of source.statistics) {
        expect(statisticRegistry.findStatistic(statistic.id)?.source).toBe(source);
      }
    }
  });
});
