import { useMemo, type CSSProperties } from "react";
import Icon from "#shared/ui/atoms/icons";
import type { WidgetComponentProps } from "#features/widgets/domain/widgetDefinition.types";
import { dateToWeekNumber } from "../../../domain/weekMath";
import type { ResolvedClassInstance } from "../../../domain/resolvedInstance.entity";
import useScheduleNow from "../../../presentation/hooks/useScheduleNow";
import {
  CLASS_TYPE_LABEL,
  buildAgenda,
  capitalize,
  findUpcoming,
  formatDayLong,
  formatDuration,
  formatMinute,
  getHolidayLabel,
  getInstancesOn,
  instanceKey,
  isDateWithinSchedule,
  relativeDayLabel,
  type AgendaItem,
} from "../../selectors/scheduleSelectors";
import ScheduleGate, {
  ScheduleMessage,
  type ReadySchedule,
} from "../../molecules/ScheduleGate";
import AttendanceControl from "../../molecules/AttendanceControl";
import "./scheduleToday.css";

export default function ScheduleTodayWidget(_props: WidgetComponentProps) {
  return (
    <ScheduleGate label="Clases de hoy" className="sch-today">
      {(ready) => <TodayBody {...ready} />}
    </ScheduleGate>
  );
}

function TodayBody({ schedule, resolveWeek, subjectsById, reasonOf }: ReadySchedule) {
  const now = useScheduleNow();

  const agenda = useMemo(
    () => buildAgenda(getInstancesOn(resolveWeek, schedule, now), now),
    [resolveWeek, schedule, now],
  );
  const holiday = getHolidayLabel(schedule, now);
  const inPeriod = isDateWithinSchedule(schedule, now);
  const week = dateToWeekNumber(schedule, now);
  const held = agenda.filter((a) => !a.instance.isCancelled).length;

  const nextUp = useMemo(
    () => (agenda.length === 0 ? findUpcoming(resolveWeek, schedule, now, 1).next[0] : undefined),
    [agenda.length, resolveWeek, schedule, now],
  );

  return (
    <>
      <header className="sch-head">
        <div>
          <h3 className="sch-title">Hoy</h3>
          <p className="sch-sub">
            {capitalize(formatDayLong(now))}
            {inPeriod && ` · Semana ${week}`}
          </p>
        </div>
        {held > 0 && (
          <span className="sch-chip">{held === 1 ? "1 clase" : `${held} clases`}</span>
        )}
      </header>

      {agenda.length > 0 ? (
        <ol className="sch-agenda">
          {agenda.map((item) => (
            <ClassRow
              key={instanceKey(item.instance)}
              item={item}
              name={subjectsById.get(item.instance.subjectId)?.name ?? "Asignatura"}
              reason={reasonOf(item.instance)}
            />
          ))}
        </ol>
      ) : (
        <ScheduleMessage
          icon={holiday ? "IconBeach" : "IconCalendarOff"}
          title={holiday ? "Hoy es festivo" : inPeriod ? "Hoy no tienes clases" : "Fuera del periodo del horario"}
          text={
            holiday ??
            (nextUp
              ? `Próxima clase ${relativeDayLabel(nextUp.date.toDate(), now)} a las ${formatMinute(nextUp.startMinute)}: ${subjectsById.get(nextUp.subjectId)?.name ?? ""}.`
              : undefined)
          }
        />
      )}
    </>
  );
}

function ClassRow({ item, name, reason }: { item: AgendaItem; name: string; reason?: string }) {
  const { instance: i, phase } = item;
  const started = phase !== "upcoming";
  const meta = [CLASS_TYPE_LABEL[i.type], i.room].filter(Boolean).join(" · ");
  const note = describeNote(i, reason);

  return (
    <li
      className="sch-class"
      style={{ "--c": i.color, "--p": item.progress } as CSSProperties}
      data-phase={phase}
      data-cancelled={i.isCancelled}
    >
      <div className="sch-class__time">
        <span>{formatMinute(i.startMinute)}</span>
        <span>{formatMinute(i.endMinute)}</span>
      </div>
      <span className="sch-class__bar" aria-hidden="true" />

      <div className="sch-class__body">
        <div className="sch-class__name">{name}</div>
        <div className="sch-class__meta">
          {meta}
          {i.professor && <span className="sch-class__prof"> · {i.professor}</span>}
        </div>
        <div className="sch-class__tags">
          {i.isCancelled ? (
            <span className="sch-tag" data-tone="bad">
              <Icon name="IconBan" /> Cancelada
            </span>
          ) : (
            <>
              {phase === "ongoing" && (
                <span className="sch-tag" data-tone="live">
                  <Icon name="IconPlayerPlay" /> En curso · quedan {formatDuration(item.minutesUntilEnd)}
                </span>
              )}
              {i.hasConflict && (
                <span className="sch-tag" data-tone="warn">
                  <Icon name="IconAlertTriangle" /> Se solapa
                </span>
              )}
            </>
          )}
        </div>
        {note && <div className="sch-class__note">{note}</div>}
      </div>

      {!i.isCancelled && (
        <div className="sch-class__actions">
          <AttendanceControl
            instance={i}
            subjectName={name}
            disabled={!started}
            disabledReason="Podrás marcar la asistencia cuando empiece la clase"
          />
        </div>
      )}

      {phase === "ongoing" && <span className="sch-class__progress" aria-hidden="true" />}
    </li>
  );
}

function describeNote(i: ResolvedClassInstance, reason?: string): string | null {
  if (i.isCancelled) return reason ? `Motivo: ${reason}` : null;
  if (!i.isException) return null;
  const place = [i.room, i.building].filter(Boolean).join(", ");
  return [place && `Aula: ${place}`, reason].filter(Boolean).join(" · ") || null;
}
