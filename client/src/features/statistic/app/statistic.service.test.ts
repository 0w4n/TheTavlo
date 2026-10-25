import { afterEach, describe, expect, it, vi } from "vitest";
import { readStatisticIds, resolveStatistics } from "./statistic.service";
import type {
  StatisticContext,
  StatisticDefinition,
  StatisticSource,
} from "../domain/statistic.types";

const ctx: StatisticContext = { now: new Date(2026, 9, 25, 12), locale: "es" };

const stat = (
  id: string,
  compute: StatisticDefinition<number>["compute"],
): StatisticDefinition<number> => ({
  id,
  title: `T ${id}`,
  description: `D ${id}`,
  icon: "IconChartBar",
  compute,
});

const source: StatisticSource<number> = {
  id: "demo",
  label: "Demo",
  icon: "IconChartBar",
  useInput: () => ({ status: "loading" }),
  statistics: [
    stat("demo.double", (n) => ({ kind: "kpi", value: String(n * 2) })),
    stat("demo.empty", () => null),
    stat("demo.broken", () => {
      throw new Error("boom");
    }),
  ],
};

afterEach(() => vi.restoreAllMocks());

describe("resolveStatistics", () => {
  it("sin ids devuelve todas, en el orden de la fuente", () => {
    vi.spyOn(console, "error").mockImplementation(() => {}); // `demo.broken` lanza a propósito
    const resolved = resolveStatistics(source, 4, ctx);

    expect(resolved.map((r) => r.id)).toEqual(["demo.double", "demo.empty", "demo.broken"]);
    expect(resolved[0]).toMatchObject({
      title: "T demo.double",
      result: { kind: "kpi", value: "8" },
      failed: false,
    });
  });

  it("respeta el orden pedido e ignora ids desconocidos con un warning", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const resolved = resolveStatistics(source, 1, ctx, ["demo.empty", "demo.nope", "demo.double"]);

    expect(resolved.map((r) => r.id)).toEqual(["demo.empty", "demo.double"]);
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it("`null` del plugin = sin datos (no es un fallo)", () => {
    const [empty] = resolveStatistics(source, 1, ctx, ["demo.empty"]);

    expect(empty).toMatchObject({ result: null, failed: false });
  });

  it("un compute que lanza solo marca ESA estadística como fallida", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const resolved = resolveStatistics(source, 3, ctx, ["demo.broken", "demo.double"]);

    expect(resolved[0]).toMatchObject({ id: "demo.broken", result: null, failed: true });
    expect(resolved[1]).toMatchObject({ id: "demo.double", failed: false });
  });
});

describe("readStatisticIds", () => {
  const fallback = ["a", "b"] as const;

  it("usa los ids de la config cuando son válidos", () => {
    expect(readStatisticIds({ statisticIds: ["x", "y"] }, fallback)).toEqual(["x", "y"]);
  });

  it.each([
    ["sin config", undefined],
    ["sin clave", {}],
    ["no es array", { statisticIds: "x" }],
    ["array vacío", { statisticIds: [] }],
    ["elementos no string", { statisticIds: ["x", 3] }],
  ])("cae al valor por defecto: %s", (_label, config) => {
    expect(readStatisticIds(config as Record<string, unknown> | undefined, fallback)).toBe(fallback);
  });
});
