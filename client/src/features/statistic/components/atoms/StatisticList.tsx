import type { ListResult } from "../../domain/statistic.types";
import { toneClass } from "./statisticTone";

export default function StatisticList({ result }: { result: ListResult }) {
  return (
    <div className="stat-list">
      <ul className="stat-list__items">
        {result.items.map((item) => (
          <li key={item.id} className={`stat-list__item ${toneClass(item.tone)}`}>
            <span className="stat-list__text">
              <span className="stat-list__label">{item.label}</span>
              {item.hint && <span className="stat-list__hint">{item.hint}</span>}
            </span>
            {item.value && <span className="stat-list__value">{item.value}</span>}
          </li>
        ))}
      </ul>
      {result.caption && <p className="stat-caption">{result.caption}</p>}
    </div>
  );
}
