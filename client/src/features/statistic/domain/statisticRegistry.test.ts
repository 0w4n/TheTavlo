import { describe, expect, it } from "vitest";
import {
  DuplicateStatisticIdError,
  DuplicateStatisticSourceError,
  StatisticRegistry,
} from "./statisticRegistry";
import type { StatisticDefinition, StatisticSource } from "./statistic.types";

const stat = (id: string): StatisticDefinition => ({
  id,
  title: id,
  description: id,
  icon: "IconChartBar",
  compute: () => null,
});

const source = (id: string, statIds: string[]): StatisticSource => ({
  id,
  label: id,
  icon: "IconChartBar",
  useInput: () => ({ status: "loading" }),
  statistics: statIds.map(stat),
});

describe("StatisticRegistry", () => {
  it("registra y recupera fuentes y estadísticas", () => {
    const registry = new StatisticRegistry();
    const tasks = source("tasks", ["tasks.a", "tasks.b"]);
    registry.register(tasks);

    expect(registry.has("tasks")).toBe(true);
    expect(registry.get("tasks")).toBe(tasks);
    expect(registry.getAll()).toEqual([tasks]);
    expect(registry.findStatistic("tasks.b")?.source).toBe(tasks);
    expect(registry.findStatistic("nope")).toBeUndefined();
    expect(registry.get("events")).toBeUndefined();
  });

  it("rechaza dos fuentes con el mismo id", () => {
    const registry = new StatisticRegistry();
    registry.register(source("tasks", ["tasks.a"]));

    expect(() => registry.register(source("tasks", ["tasks.z"]))).toThrow(
      DuplicateStatisticSourceError,
    );
  });

  it("rechaza ids de estadística repetidos entre fuentes y NO deja la fuente a medias", () => {
    const registry = new StatisticRegistry();
    registry.register(source("tasks", ["x.shared"]));

    expect(() => registry.register(source("events", ["events.ok", "x.shared"]))).toThrow(
      DuplicateStatisticIdError,
    );
    expect(registry.has("events")).toBe(false);
    expect(registry.findStatistic("events.ok")).toBeUndefined();
  });

  it("rechaza ids repetidos dentro de la misma fuente", () => {
    const registry = new StatisticRegistry();

    expect(() => registry.register(source("tasks", ["tasks.a", "tasks.a"]))).toThrow(
      DuplicateStatisticIdError,
    );
  });
});
