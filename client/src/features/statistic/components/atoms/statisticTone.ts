import type { StatisticTone } from "../../domain/statistic.types";

/** Clase CSS que fija `--stat-tone` según el tono semántico. */
export function toneClass(tone: StatisticTone | undefined): string {
  return `stat-tone--${tone ?? "neutral"}`;
}
