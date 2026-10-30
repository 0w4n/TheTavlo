import { useMemo, type CSSProperties } from "react";
import Icon from "#shared/ui/atoms/icons";
import type { WidgetComponentProps } from "#features/widgets/domain/widgetDefinition.types";
import useScheduleNow from "../../../presentation/hooks/useScheduleNow";
import {
  computeAttendance,
  type AttendanceTally,
} from "../../selectors/scheduleSelectors";
import ScheduleGate, {
  ScheduleMessage,
  type ReadySchedule,
} from "../../molecules/ScheduleGate";
import "./scheduleAttendance.css";

const DEFAULT_MIN_PERCENT = 80;

const pct = (rate: number) => `${Math.round(rate * 100)} %`;

/** Texto accesible de un reparto: lo que la barra dice con colores, dicho con palabras. */
function describeTally(t: AttendanceTally): string {
  const parts = [
    `${t.present} ${t.present === 1 ? "presente" : "presentes"}`,
    `${t.late} con retraso`,
    `${t.absent} ${t.absent === 1 ? "falta" : "faltas"}`,
    `${t.unmarked} sin marcar`,
  ];
  return parts.join(", ");
}

export default function ScheduleAttendanceWidget({ config }: WidgetComponentProps) {
  const minPercent =
    typeof config?.minAttendance === "number" && config.minAttendance > 0 && config.minAttendance <= 100
      ? config.minAttendance
      : DEFAULT_MIN_PERCENT;

  return (
    <ScheduleGate label="Asistencia" className="sch-att-widget">
      {(ready) => <AttendanceBody {...ready} minPercent={minPercent} />}
    </ScheduleGate>
  );
}

function AttendanceBody({
  schedule,
  resolveWeek,
  subjects,
  minPercent,
}: ReadySchedule & { minPercent: number }) {
  const now = useScheduleNow(5 * 60_000);

  const summary = useMemo(
    () => computeAttendance(resolveWeek, schedule, subjects, now, minPercent / 100),
    [resolveWeek, schedule, subjects, now, minPercent],
  );
  const { overall, bySubject } = summary;

  if (overall.held === 0) {
    return (
      <ScheduleMessage
        icon="IconUserCheck"
        title="Todavía no hay clases que contar"
        text="La asistencia aparece en cuanto termine tu primera clase."
      />
    );
  }

  return (
    <>
      <header className="sch-head">
        <div>
          <h3 className="sch-title">Asistencia</h3>
          <p className="sch-sub">
            {overall.held} {overall.held === 1 ? "clase" : "clases"} hasta hoy
            {overall.unmarked > 0 && ` · ${overall.unmarked} sin marcar`}
          </p>
        </div>
        {overall.rate !== null && (
          <span className="sch-chip" data-tone={overall.belowThreshold ? "warn" : undefined}>
            {overall.belowThreshold && <Icon name="IconAlertTriangle" />}
            {pct(overall.rate)}
          </span>
        )}
      </header>

      <div>
        <Bar tally={overall} large />
        <ul className="sch-legend" aria-hidden="true">
          <li data-seg="present">{overall.present} presentes</li>
          <li data-seg="late">{overall.late} con retraso</li>
          <li data-seg="absent">{overall.absent} {overall.absent === 1 ? "falta" : "faltas"}</li>
          <li data-seg="unmarked">{overall.unmarked} sin marcar</li>
        </ul>
      </div>

      <ul className="sch-subjects">
        {bySubject.map((s) => (
          <li
            key={s.subjectId}
            className="sch-subject"
            style={{ "--c": s.color } as CSSProperties}
            data-below={s.belowThreshold}
          >
            <span className="sch-subject__dot" aria-hidden="true" />
            <span className="sch-subject__name">{s.name}</span>
            <span className="sch-subject__rate">
              {s.belowThreshold && (
                <>
                  <Icon name="IconAlertTriangle" />
                  <span className="sch-sr">Por debajo del {minPercent} %: </span>
                </>
              )}
              {s.rate === null ? "—" : pct(s.rate)}
            </span>
            <Bar tally={s} />
          </li>
        ))}
      </ul>
    </>
  );
}

function Bar({ tally, large }: { tally: AttendanceTally; large?: boolean }) {
  const total = Math.max(1, tally.held);
  const keys = ["present", "late", "absent", "unmarked"] as const;
  return (
    <div className="sch-bar" data-large={large} role="img" aria-label={describeTally(tally)}>
      {keys
        .filter((key) => tally[key] > 0)
        .map((key) => (
          <span key={key} data-seg={key} style={{ flexGrow: tally[key] / total }} />
        ))}
    </div>
  );
}
