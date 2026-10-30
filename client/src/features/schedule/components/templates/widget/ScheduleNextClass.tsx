import { useMemo, type CSSProperties } from "react";
import Icon from "#shared/ui/atoms/icons";
import type { WidgetComponentProps } from "#features/widgets/domain/widgetDefinition.types";
import type { ResolvedClassInstance } from "../../../domain/resolvedInstance.entity";
import useElementSize from "../../../presentation/hooks/useElementSize";
import useScheduleNow from "../../../presentation/hooks/useScheduleNow";
import {
  CLASS_TYPE_LABEL,
  capitalize,
  findUpcoming,
  formatDuration,
  formatMinute,
  formatTimeRange,
  instanceBounds,
  instanceKey,
  isSameDay,
  relativeDayLabel,
} from "../../selectors/scheduleSelectors";
import ScheduleGate, {
  ScheduleMessage,
  type ReadySchedule,
} from "../../molecules/ScheduleGate";
import "./scheduleNextClass.css";

/** Alto mínimo (px) del widget para que, además de la tarjeta principal, quepa "Después". */
const MIN_HEIGHT_FOR_LATER = 290;

export default function ScheduleNextClassWidget(_props: WidgetComponentProps) {
  return (
    <ScheduleGate label="Próxima clase" className="sch-next">
      {(ready) => <NextBody {...ready} />}
    </ScheduleGate>
  );
}

function NextBody({ schedule, resolveWeek, subjectsById }: ReadySchedule) {
  const now = useScheduleNow();
  const [ref, size] = useElementSize<HTMLDivElement>();

  const upcoming = useMemo(
    () => findUpcoming(resolveWeek, schedule, now, 3),
    [resolveWeek, schedule, now],
  );

  const hero = upcoming.current ?? upcoming.next[0] ?? null;
  const later = (upcoming.current ? upcoming.next : upcoming.next.slice(1)).slice(0, 2);
  const nameOf = (i: ResolvedClassInstance) => subjectsById.get(i.subjectId)?.name ?? "Asignatura";

  return (
    <div className="sch-next__body" ref={ref}>
      {hero ? (
        <>
          <Hero instance={hero} name={nameOf(hero)} ongoing={hero === upcoming.current} now={now} />
          {size.height >= MIN_HEIGHT_FOR_LATER && later.length > 0 && (
            <div className="sch-next__later">
              <h4 className="sch-next__later-title">Después</h4>
              <ul>
                {later.map((i) => (
                  <li key={instanceKey(i)} style={{ "--c": i.color } as CSSProperties}>
                    <span className="sch-next__dot" aria-hidden="true" />
                    <span className="sch-next__later-when">
                      {isSameDay(i.date.toDate(), now)
                        ? formatMinute(i.startMinute)
                        : `${capitalize(relativeDayLabel(i.date.toDate(), now))} ${formatMinute(i.startMinute)}`}
                    </span>
                    <span className="sch-next__later-name">{nameOf(i)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      ) : (
        <ScheduleMessage
          icon="IconCalendarCheck"
          title="No quedan clases"
          text="No hay más clases programadas en el periodo del horario."
        />
      )}
    </div>
  );
}

function Hero({
  instance: i,
  name,
  ongoing,
  now,
}: {
  instance: ResolvedClassInstance;
  name: string;
  ongoing: boolean;
  now: Date;
}) {
  const { start, end } = instanceBounds(i);
  const minutesToStart = Math.ceil((start.getTime() - now.getTime()) / 60_000);
  const minutesToEnd = Math.ceil((end.getTime() - now.getTime()) / 60_000);
  const progress = ongoing
    ? Math.min(1, Math.max(0, (now.getTime() - start.getTime()) / (end.getTime() - start.getTime())))
    : 0;
  const sameDay = isSameDay(start, now);

  // Qué se dice en grande: lo más útil según lo lejos que esté la clase.
  let big: string;
  let small: string;
  if (ongoing) {
    big = `Quedan ${formatDuration(minutesToEnd)}`;
    small = "para que termine";
  } else if (sameDay && minutesToStart <= 1) {
    big = "Empieza ahora";
    small = formatTimeRange(i.startMinute, i.endMinute);
  } else if (sameDay) {
    big = `En ${formatDuration(minutesToStart)}`;
    small = `Hoy, ${formatTimeRange(i.startMinute, i.endMinute)}`;
  } else {
    big = capitalize(relativeDayLabel(start, now));
    small = formatTimeRange(i.startMinute, i.endMinute);
  }

  const where = [i.room, i.building].filter(Boolean).join(" · ");

  return (
    <article className="sch-next__hero" style={{ "--c": i.color } as CSSProperties} data-ongoing={ongoing}>
      <p className="sch-next__kicker">
        <Icon name={ongoing ? "IconPlayerPlay" : "IconClockPlay"} />
        {ongoing ? "En curso" : "Próxima clase"}
        <span className="sch-next__type">{CLASS_TYPE_LABEL[i.type]}</span>
      </p>
      <h3 className="sch-next__name">{name}</h3>
      <p className="sch-next__big">{big}</p>
      <p className="sch-next__small">{small}</p>

      {ongoing && (
        <div
          className="sch-next__progress"
          role="progressbar"
          aria-label="Progreso de la clase"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress * 100)}
        >
          <span style={{ width: `${progress * 100}%` }} />
        </div>
      )}

      {(where || i.professor || i.hasConflict) && (
        <ul className="sch-next__facts">
          {where && (
            <li>
              <Icon name="IconMapPin" /> {where}
            </li>
          )}
          {i.professor && (
            <li>
              <Icon name="IconUser" /> {i.professor}
            </li>
          )}
          {i.hasConflict && (
            <li data-tone="warn">
              <Icon name="IconAlertTriangle" /> Se solapa con otra clase
            </li>
          )}
        </ul>
      )}
    </article>
  );
}
