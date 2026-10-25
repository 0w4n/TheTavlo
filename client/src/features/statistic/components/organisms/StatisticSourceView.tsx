import { useMemo } from "react";
import { statisticRegistry } from "../../infrastructure/statisticDiscovery";
import {
  resolveStatistics,
} from "../../app/statistic.service";
import type { StatisticSource } from "../../domain/statistic.types";
import { useNow } from "../../presentation/hooks/useNow";
import StatisticCard from "../molecules/StatisticCard";

import "./statisticSourceView.css";

const LOCALE = "es";

interface StatisticSourceViewProps {
  /** Fuente (plugin) de la que se leen los datos: "tasks", "events"... */
  sourceId: string;
  /** Qué estadísticas pintar y en qué orden. Sin esto, todas las de la fuente. */
  statisticIds?: readonly string[];
}

/**
 * Punto de entrada genérico de los widgets de estadísticas. Resuelve la fuente
 * en el registro y delega en `StatisticSourceBody`, que SÍ llama al hook del
 * plugin. El `key={source.id}` garantiza que cada instancia de
 * `StatisticSourceBody` use siempre el mismo hook (reglas de hooks).
 */
export default function StatisticSourceView({
  sourceId,
  statisticIds,
}: StatisticSourceViewProps) {
  const source = statisticRegistry.get(sourceId);

  if (!source) {
    return (
      <p className="stat-view__message" role="status">
        La fuente de estadísticas «{sourceId}» no está disponible.
      </p>
    );
  }

  return (
    <StatisticSourceBody
      key={source.id}
      source={source}
      statisticIds={statisticIds}
    />
  );
}

function StatisticSourceBody({
  source,
  statisticIds,
}: {
  source: StatisticSource;
  statisticIds?: readonly string[];
}) {
  const { useInput } = source;
  const input = useInput();
  const now = useNow();

  const resolved = useMemo(
    () =>
      input.status === "ready"
        ? resolveStatistics(
            source,
            input.data,
            { now, locale: LOCALE },
            statisticIds,
          )
        : [],
    [source, input, now, statisticIds],
  );

  if (input.status === "loading") {
    return (
      <p className="stat-view__message" role="status">
        Cargando estadísticas…
      </p>
    );
  }

  if (input.status === "error") {
    return (
      <p className="stat-view__message" role="alert">
        {input.message ?? "No se pudieron cargar los datos."}
      </p>
    );
  }

  return (
    <section className="stat-view" aria-label={`Estadísticas de ${source.label}`}>
      {resolved.map((statistic) => (
        <StatisticCard key={statistic.id} statistic={statistic} />
      ))}
    </section>
  );
}
