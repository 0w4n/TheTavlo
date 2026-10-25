import { useId } from "react";
import Icon from "#shared/ui/atoms/icons";
import type { ResolvedStatistic } from "../../app/statistic.service";
import type { StatisticResult } from "../../domain/statistic.types";
import {
  StatisticDistribution,
  StatisticKpi,
  StatisticList,
  StatisticProgressRing,
  StatisticSeries,
} from "../atoms";

import "./statisticCard.css";

function renderResult(result: StatisticResult) {
  switch (result.kind) {
    case "kpi":
      return <StatisticKpi result={result} />;
    case "progress":
      return <StatisticProgressRing result={result} />;
    case "distribution":
      return <StatisticDistribution result={result} />;
    case "series":
      return <StatisticSeries result={result} />;
    case "list":
      return <StatisticList result={result} />;
    default: {
      // Si un plugin devuelve un `kind` que este host no conoce, se degrada
      // con elegancia en vez de romper el widget completo.
      const unknown: never = result;
      console.warn("[statistic] kind no soportado:", unknown);
      return <p className="stat-card__message">Formato no soportado.</p>;
    }
  }
}

export default function StatisticCard({
  statistic,
}: {
  statistic: ResolvedStatistic;
}) {
  const titleId = useId();
  const descriptionId = useId();

  return (
    <article
      className={`stat-card stat-card--${statistic.result?.kind ?? "empty"}`}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
    >
      <header className="stat-card__header" title={statistic.description}>
        <Icon
          name={statistic.icon}
          size={16}
          stroke={2}
          className="stat-card__icon"
        />
        <h3 id={titleId} className="stat-card__title">
          {statistic.title}
        </h3>
      </header>
      <p id={descriptionId} className="stat-sr-only">
        {statistic.description}
      </p>

      <div className="stat-card__body">
        {statistic.failed ? (
          <p className="stat-card__message" role="status">
            No se pudo calcular esta estadística.
          </p>
        ) : statistic.result === null ? (
          <p className="stat-card__message" role="status">
            Aún no hay datos suficientes.
          </p>
        ) : (
          renderResult(statistic.result)
        )}
      </div>
    </article>
  );
}
