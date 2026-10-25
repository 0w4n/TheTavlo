import type { KpiResult } from "../../domain/statistic.types";
import Icon from "#shared/ui/atoms/icons";
import { toneClass } from "./statisticTone";

const TREND_ICON = {
  up: "IconTrendingUp",
  down: "IconTrendingDown",
  flat: "IconMinus",
} as const;

export default function StatisticKpi({ result }: { result: KpiResult }) {
  return (
    <div className={`stat-kpi ${toneClass(result.tone)}`}>
      <p className="stat-kpi__main">
        <span className="stat-kpi__value">{result.value}</span>
        {result.unit && <span className="stat-kpi__unit">{result.unit}</span>}
      </p>

      {result.trend && (
        <p className={`stat-kpi__trend ${toneClass(result.trend.tone)}`}>
          {/* El texto lleva el significado; el ícono y el color solo lo refuerzan. */}
          <Icon
            name={TREND_ICON[result.trend.direction]}
            size={14}
            stroke={2}
            className="stat-kpi__trend-icon"
          />
          <span>{result.trend.label}</span>
        </p>
      )}

      {result.caption && <p className="stat-caption">{result.caption}</p>}
    </div>
  );
}
