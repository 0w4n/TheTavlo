import type { ProgressResult } from "../../domain/statistic.types";
import { StatisticRules } from "../../domain/statistic.rules";
import { toneClass } from "./statisticTone";

const RADIUS = 42;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function StatisticProgressRing({
  result,
}: {
  result: ProgressResult;
}) {
  const ratio = Math.min(1, StatisticRules.ratio(result.value, result.total));
  const percent = Math.round(ratio * 100);
  const label = result.label ?? `${percent}%`;

  return (
    <div className={`stat-ring ${toneClass(result.tone)}`}>
      <svg
        className="stat-ring__svg"
        viewBox="0 0 100 100"
        role="img"
        aria-label={`${percent}% — ${result.value} de ${result.total}`}
      >
        <circle className="stat-ring__track" cx="50" cy="50" r={RADIUS} />
        <circle
          className="stat-ring__value"
          cx="50"
          cy="50"
          r={RADIUS}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - ratio)}
          transform="rotate(-90 50 50)"
        />
        <text
          className="stat-ring__label"
          x="50"
          y="50"
          textAnchor="middle"
          dominantBaseline="central"
        >
          {label}
        </text>
      </svg>
      {result.caption && <p className="stat-caption">{result.caption}</p>}
    </div>
  );
}
