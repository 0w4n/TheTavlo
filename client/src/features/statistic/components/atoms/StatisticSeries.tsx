import type { SeriesResult } from "../../domain/statistic.types";
import { toneClass } from "./statisticTone";

export default function StatisticSeries({ result }: { result: SeriesResult }) {
  const max = Math.max(1, ...result.points.map((p) => p.value));
  const unit = result.unit ? ` ${result.unit}` : "";

  return (
    <div className={`stat-series ${toneClass(result.tone)}`}>
      <ol className="stat-series__bars">
        {result.points.map((point) => (
          <li
            key={point.label}
            className={
              point.highlight
                ? "stat-series__col stat-series__col--highlight"
                : "stat-series__col"
            }
            aria-label={`${point.label}: ${point.value}${unit}`}
          >
            <span className="stat-series__value" aria-hidden="true">
              {point.value}
            </span>
            <span className="stat-series__track" aria-hidden="true">
              <span
                className="stat-series__bar"
                style={{ height: `${(point.value / max) * 100}%` }}
              />
            </span>
            <span className="stat-series__label" aria-hidden="true">
              {point.label}
            </span>
          </li>
        ))}
      </ol>
      {result.caption && <p className="stat-caption">{result.caption}</p>}
    </div>
  );
}
