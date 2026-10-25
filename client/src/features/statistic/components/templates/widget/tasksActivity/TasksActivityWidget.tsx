import type { WidgetComponentProps } from "#features/widgets/domain/widgetDefinition.types";
import StatisticSourceView from "../../../organisms/StatisticSourceView";
import { readStatisticIds } from "../../../../app/statistic.service";
import { DEFAULT_STATISTIC_IDS, SOURCE_ID } from "./tasksActivity.config";

export default function TasksActivityWidget({ config }: WidgetComponentProps) {
  // `config.statisticIds` permite personalizar el widget sin tocar código;
  // sin él (o con datos inválidos) se usan las estadísticas por defecto.
  const statisticIds = readStatisticIds(config, DEFAULT_STATISTIC_IDS);

  return <StatisticSourceView sourceId={SOURCE_ID} statisticIds={statisticIds} />;
}
