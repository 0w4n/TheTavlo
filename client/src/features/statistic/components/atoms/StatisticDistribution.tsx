import type { DistributionResult } from "../../domain/statistic.types";
import { StatisticRules } from "../../domain/statistic.rules";
import { toneClass } from "./statisticTone";

export default function StatisticDistribution({
  result,
}: {
  result: DistributionResult;
}) {
  const total = result.slices.reduce((sum, s) => sum + s.value, 0);
  const summary = result.slices
    .map((s) => `${s.label}: ${s.value}`)
    .join(", ");

  return (
    <div className="stat-dist">
      <div
        className="stat-dist__bar"
        role="img"
        aria-label={`Reparto de ${total} — ${summary}`}
      >
        {result.slices
          .filter((s) => s.value > 0)
          .map((s) => (
            <span
              key={s.id}
              className={`stat-dist__segment ${toneClass(s.tone)}`}
              style={{ flexGrow: s.value }}
              title={`${s.label}: ${s.value}`}
            />
          ))}
      </div>

      <ul className="stat-dist__legend">
        {result.slices.map((s) => (
          <li key={s.id} className="stat-dist__item">
            <span
              className={`stat-dist__swatch ${toneClass(s.tone)}`}
              aria-hidden="true"
            />
            <span className="stat-dist__label">{s.label}</span>
            <span className="stat-dist__count">
              {s.value}
              <span className="stat-dist__percent">
                {" "}
                · {StatisticRules.percent(s.value, total)}%
              </span>
            </span>
          </li>
        ))}
      </ul>

      {result.caption && <p className="stat-caption">{result.caption}</p>}
    </div>
  );
}
