import type { StatisticTone } from "./statistic.types";

/**
 * Reglas puras y reutilizables por cualquier plugin al armar resultados.
 * Mantenerlas aquí evita que cada Feature reinvente "¿qué es un buen %?".
 */
export class StatisticRules {
  /** Evita NaN/Infinity: 0 cuando no hay denominador. */
  static ratio(part: number, total: number): number {
    return total > 0 ? part / total : 0;
  }

  static percent(part: number, total: number): number {
    return Math.round(StatisticRules.ratio(part, total) * 100);
  }

  /** Tono para un porcentaje donde "más es mejor" (finalización, puntualidad). */
  static toneForHigherIsBetter(percent: number): StatisticTone {
    if (percent >= 75) return "positive";
    if (percent >= 40) return "info";
    return "warning";
  }

  /** Tendencia entre dos periodos. `higherIsBetter` define si subir es bueno. */
  static trend(
    current: number,
    previous: number,
    higherIsBetter = true,
  ): { direction: "up" | "down" | "flat"; delta: number; tone: StatisticTone } {
    const delta = current - previous;
    if (delta === 0) return { direction: "flat", delta, tone: "neutral" };

    const direction = delta > 0 ? "up" : "down";
    const good = higherIsBetter ? delta > 0 : delta < 0;

    return { direction, delta, tone: good ? "positive" : "warning" };
  }
}
