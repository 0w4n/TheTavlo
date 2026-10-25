import { describe, expect, it } from "vitest";
import { discoverWidgetDefinitions } from "#features/widgets/infraestructure/widgetDiscovery";
import { statisticRegistry } from "../../../infraestructure/statisticDiscovery";
import { readStatisticIds } from "../../../app/statistic.service";

// Prueba de INTEGRIDAD entre los dos sistemas de plugins: cada widget de
// estadísticas referencia ids por texto (config), así que si un plugin
// renombra o elimina una estadística, este test lo delata antes de que el
// widget se quede con un hueco silencioso.

const STATISTIC_WIDGET_TYPES = [
  "tasks-progress",
  "tasks-punctuality",
  "tasks-activity",
  "tasks-workload",
];

describe("widgets de estadísticas", () => {
  const definitions = discoverWidgetDefinitions().filter((d) =>
    STATISTIC_WIDGET_TYPES.includes(d.type),
  );

  it("el discovery de widgets encuentra los 4 (aunque vivan en subcarpetas)", () => {
    expect(definitions.map((d) => d.type).sort()).toEqual([...STATISTIC_WIDGET_TYPES].sort());
  });

  it.each(STATISTIC_WIDGET_TYPES)("%s: metadata, layout y load() válidos", (type) => {
    const definition = definitions.find((d) => d.type === type)!;

    expect(definition.metadata.name).toBeTruthy();
    expect(definition.metadata.description).toBeTruthy();
    expect(definition.metadata.icon.startsWith("Icon")).toBe(true);
    expect(definition.metadata.category).toBe("productivity");
    expect(definition.defaultLayout?.lg).toBeDefined();
    expect(typeof definition.load).toBe("function");
  });

  it.each(STATISTIC_WIDGET_TYPES)(
    "%s: todos los statisticIds por defecto existen en la fuente `tasks`",
    (type) => {
      const definition = definitions.find((d) => d.type === type)!;
      const ids = readStatisticIds(definition.defaultConfig, []);
      const tasks = statisticRegistry.get("tasks")!;
      const available = new Set(tasks.statistics.map((s) => s.id));

      expect(ids.length).toBeGreaterThan(0);
      for (const id of ids) expect(available.has(id)).toBe(true);
    },
  );

  it("ninguna estadística de tareas queda sin mostrarse en algún widget", () => {
    const used = new Set(
      definitions.flatMap((d) => [...readStatisticIds(d.defaultConfig, [])]),
    );
    const all = statisticRegistry.get("tasks")!.statistics.map((s) => s.id);

    expect(all.filter((id) => !used.has(id))).toEqual([]);
  });
});
