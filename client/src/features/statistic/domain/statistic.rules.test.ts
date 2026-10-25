import { describe, expect, it } from "vitest";
import { StatisticRules } from "./statistic.rules";

describe("StatisticRules", () => {
  it("ratio/percent no devuelven NaN con total 0", () => {
    expect(StatisticRules.ratio(3, 0)).toBe(0);
    expect(StatisticRules.percent(3, 0)).toBe(0);
    expect(StatisticRules.percent(1, 3)).toBe(33);
    expect(StatisticRules.percent(2, 3)).toBe(67);
  });

  it("toneForHigherIsBetter: umbrales 75 / 40", () => {
    expect(StatisticRules.toneForHigherIsBetter(100)).toBe("positive");
    expect(StatisticRules.toneForHigherIsBetter(75)).toBe("positive");
    expect(StatisticRules.toneForHigherIsBetter(74)).toBe("info");
    expect(StatisticRules.toneForHigherIsBetter(40)).toBe("info");
    expect(StatisticRules.toneForHigherIsBetter(39)).toBe("warning");
  });

  it("trend: dirección, delta y tono según si subir es bueno", () => {
    expect(StatisticRules.trend(5, 3)).toEqual({ direction: "up", delta: 2, tone: "positive" });
    expect(StatisticRules.trend(1, 3)).toEqual({ direction: "down", delta: -2, tone: "warning" });
    expect(StatisticRules.trend(2, 2)).toEqual({ direction: "flat", delta: 0, tone: "neutral" });
    expect(StatisticRules.trend(5, 3, false).tone).toBe("warning");
    expect(StatisticRules.trend(1, 3, false).tone).toBe("positive");
  });
});
