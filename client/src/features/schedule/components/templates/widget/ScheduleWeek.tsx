import { useEffect, useMemo, useState, type CSSProperties, type KeyboardEvent } from "react";
import Icon from "#shared/ui/atoms/icons";
import type { WidgetComponentProps } from "#features/widgets/domain/widgetDefinition.types";
import {
  dateToWeekNumber,
  getScheduleWeekCount,
  weekNumberAndDayToDate,
} from "../../../domain/weekMath";
import type { ResolvedClassInstance } from "../../../domain/resolvedInstance.entity";
import useElementSize from "../../../presentation/hooks/useElementSize";
import useScheduleNow from "../../../presentation/hooks/useScheduleNow";
import {
  CLASS_TYPE_LABEL,
  DAY_INITIAL,
  capitalize,
  clampWeek,
  computeGridRange,
  formatDateRange,
  formatMinute,
  formatTimeRange,
  getHolidayLabel,
  getVisibleDays,
  instanceKey,
  isDateWithinSchedule,
  isSameDay,
  layoutDayBlocks,
  weekdayName,
  type IsoDay,
} from "../../selectors/scheduleSelectors";
import ScheduleGate, { type ReadySchedule } from "../../molecules/ScheduleGate";
import "./scheduleWeek.css";

/** Por debajo de este ancho (px) la semana se muestra de día en día, con pestañas. */
const COMPACT_BELOW = 520;

export default function ScheduleWeekWidget(_props: WidgetComponentProps) {
  return (
    <ScheduleGate label="Horario semanal" className="sch-week">
      {(ready) => <WeekBody {...ready} />}
    </ScheduleGate>
  );
}

function WeekBody({
  schedule,
  resolveWeek,
  subjectsById,
  visibleSlots,
  visibleExceptions,
  reasonOf,
}: ReadySchedule) {
  const now = useScheduleNow(60_000);
  const weekCount = getScheduleWeekCount(schedule);
  const currentWeek = clampWeek(dateToWeekNumber(schedule, now), weekCount);

  const [week, setWeek] = useState(currentWeek);
  const [picked, setPicked] = useState<IsoDay | null>(null);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [ref, size] = useElementSize<HTMLDivElement>();
  const compact = size.width > 0 && size.width < COMPACT_BELOW;

  const range = useMemo(
    () => computeGridRange(visibleSlots, visibleExceptions),
    [visibleSlots, visibleExceptions],
  );
  const days = useMemo(
    () => getVisibleDays(visibleSlots, visibleExceptions, schedule.weekStartsOn),
    [visibleSlots, visibleExceptions, schedule.weekStartsOn],
  );
  const instances = useMemo(() => resolveWeek(week), [resolveWeek, week]);

  const columns = useMemo(
    () =>
      days.map((dow) => {
        const date = weekNumberAndDayToDate(schedule, week, dow);
        return {
          dow,
          date,
          isToday: isSameDay(date, now),
          holiday: getHolidayLabel(schedule, date),
          outside: !isDateWithinSchedule(schedule, date),
          instances: instances.filter((i) => isSameDay(i.date.toDate(), date)),
        };
      }),
    [days, schedule, week, now, instances],
  );

  // Día visible en modo compacto: el elegido, o hoy, o el primero con clases.
  const fallbackDow =
    columns.find((c) => c.isToday)?.dow ??
    columns.find((c) => c.instances.length > 0)?.dow ??
    columns[0]?.dow;
  const activeDow = picked !== null && days.includes(picked) ? picked : fallbackDow;
  const shown = compact ? columns.filter((c) => c.dow === activeDow) : columns;

  const selected = useMemo(
    () => instances.find((i) => instanceKey(i) === selectedKey) ?? null,
    [instances, selectedKey],
  );

  // Al cambiar de semana el detalle abierto ya no corresponde.
  useEffect(() => setSelectedKey(null), [week]);

  const hours = Math.max(1, (range.endMinute - range.startMinute) / 60);
  const nowMinute = now.getHours() * 60 + now.getMinutes();
  const first = columns[0]?.date;
  const last = columns[columns.length - 1]?.date;

  const onTabKey = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const delta = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!delta) return;
    event.preventDefault();
    const next = columns[(index + delta + columns.length) % columns.length];
    setPicked(next.dow);
    (event.currentTarget.parentElement?.children[(index + delta + columns.length) % columns.length] as HTMLElement)?.focus();
  };

  return (
    <div className="sch-week__wrap" ref={ref} data-compact={compact}>
      <header className="sch-week__bar">
        <div className="sch-week__title">
          <h3 className="sch-title">Semana {week}</h3>
          {first && last && <p className="sch-sub">{formatDateRange(first, last)}</p>}
        </div>
        <div className="sch-week__nav" role="group" aria-label="Cambiar de semana">
          <button
            type="button"
            onClick={() => setWeek((w) => clampWeek(w - 1, weekCount))}
            disabled={week <= 1}
            aria-label="Semana anterior"
          >
            <Icon name="IconChevronLeft" />
          </button>
          <button
            type="button"
            className="sch-week__today"
            onClick={() => {
              setWeek(currentWeek);
              setPicked(null);
            }}
            disabled={week === currentWeek && picked === null}
          >
            Hoy
          </button>
          <button
            type="button"
            onClick={() => setWeek((w) => clampWeek(w + 1, weekCount))}
            disabled={week >= weekCount}
            aria-label="Semana siguiente"
          >
            <Icon name="IconChevronRight" />
          </button>
        </div>
      </header>

      {compact && (
        <div className="sch-week__tabs" role="tablist" aria-label="Día de la semana">
          {columns.map((c, index) => (
            <button
              key={c.dow}
              type="button"
              role="tab"
              id={`sch-tab-${c.dow}`}
              aria-selected={c.dow === activeDow}
              aria-controls="sch-week-panel"
              tabIndex={c.dow === activeDow ? 0 : -1}
              data-today={c.isToday}
              data-has={c.instances.length > 0}
              onClick={() => setPicked(c.dow)}
              onKeyDown={(e) => onTabKey(e, index)}
            >
              <span>{DAY_INITIAL[c.dow]}</span>
              <span>{c.date.getDate()}</span>
            </button>
          ))}
        </div>
      )}

      <div
        className="sch-week__scroll"
        id="sch-week-panel"
        role={compact ? "tabpanel" : undefined}
        aria-labelledby={compact ? `sch-tab-${activeDow}` : undefined}
      >
        <div
          className="sch-week__grid"
          style={{ "--cols": shown.length, "--hours": hours } as CSSProperties}
        >
          <div className="sch-week__corner" />
          {shown.map((c) => (
            <div
              key={`h-${c.dow}`}
              className="sch-week__dayhead"
              data-today={c.isToday}
              aria-current={c.isToday ? "date" : undefined}
            >
              <span className="sch-week__dh-long">{capitalize(weekdayName(c.date).slice(0, 3))}</span>
              <span className="sch-week__dh-short">{DAY_INITIAL[c.dow]}</span>
              <span className="sch-week__daynum">{c.date.getDate()}</span>
            </div>
          ))}

          <div className="sch-week__axis" aria-hidden="true">
            {Array.from({ length: hours }, (_, i) => (
              <span key={i} style={{ top: `${(i / hours) * 100}%` }}>
                {formatMinute(range.startMinute + i * 60)}
              </span>
            ))}
          </div>

          {shown.map((c) => {
            const blocks = layoutDayBlocks(c.instances, range);
            const nowPct = ((nowMinute - range.startMinute) / (range.endMinute - range.startMinute)) * 100;
            return (
              <div
                key={`c-${c.dow}`}
                className="sch-week__col"
                data-today={c.isToday}
                data-off={c.holiday !== null || c.outside}
                title={c.holiday ?? undefined}
              >
                {c.holiday && <span className="sch-week__holiday">{c.holiday}</span>}
                {c.isToday && nowPct >= 0 && nowPct <= 100 && (
                  <span className="sch-week__now" style={{ top: `${nowPct}%` }} aria-hidden="true" />
                )}
                {blocks.map((b) => (
                  <Block
                    key={instanceKey(b.instance)}
                    instance={b.instance}
                    name={subjectsById.get(b.instance.subjectId)?.name ?? "Asignatura"}
                    style={{
                      top: `${b.topPct}%`,
                      height: `${b.heightPct}%`,
                      left: `calc(${b.lane} * 100% / ${b.lanes} + 1px)`,
                      width: `calc(100% / ${b.lanes} - 2px)`,
                    }}
                    selected={instanceKey(b.instance) === selectedKey}
                    onSelect={() =>
                      setSelectedKey((k) => (k === instanceKey(b.instance) ? null : instanceKey(b.instance)))
                    }
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {selected && (
        <Detail
          instance={selected}
          name={subjectsById.get(selected.subjectId)?.name ?? "Asignatura"}
          reason={reasonOf(selected)}
          onClose={() => setSelectedKey(null)}
        />
      )}
    </div>
  );
}

function Block({
  instance: i,
  name,
  style,
  selected,
  onSelect,
}: {
  instance: ResolvedClassInstance;
  name: string;
  style: CSSProperties;
  selected: boolean;
  onSelect: () => void;
}) {
  const label = [
    name,
    CLASS_TYPE_LABEL[i.type],
    formatTimeRange(i.startMinute, i.endMinute),
    i.room,
    i.isCancelled ? "cancelada" : null,
    i.hasConflict ? "se solapa con otra clase" : null,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <button
      type="button"
      className="sch-block"
      style={{ ...style, "--c": i.color } as CSSProperties}
      data-cancelled={i.isCancelled}
      data-conflict={i.hasConflict}
      aria-pressed={selected}
      aria-label={label}
      title={label}
      onClick={onSelect}
    >
      <span className="sch-block__name">{name}</span>
      <span className="sch-block__meta">
        {i.isCancelled ? "Cancelada" : i.room}
      </span>
      {i.hasConflict && !i.isCancelled && (
        <Icon name="IconAlertTriangle" className="sch-block__warn" />
      )}
    </button>
  );
}

function Detail({
  instance: i,
  name,
  reason,
  onClose,
}: {
  instance: ResolvedClassInstance;
  name: string;
  reason?: string;
  onClose: () => void;
}) {
  const where = [i.room, i.building].filter(Boolean).join(", ");
  return (
    <aside className="sch-week__detail" style={{ "--c": i.color } as CSSProperties} aria-label={`Detalle de ${name}`}>
      <span className="sch-week__detail-bar" aria-hidden="true" />
      <div className="sch-week__detail-body">
        <p className="sch-week__detail-name">
          {name}
          {i.isCancelled && <span className="sch-tag" data-tone="bad">Cancelada</span>}
          {i.hasConflict && !i.isCancelled && <span className="sch-tag" data-tone="warn">Se solapa</span>}
        </p>
        <p className="sch-week__detail-line">
          {capitalize(weekdayName(i.date.toDate()))} {i.date.toDate().getDate()} · {formatTimeRange(i.startMinute, i.endMinute)} · {CLASS_TYPE_LABEL[i.type]}
        </p>
        {(where || i.professor) && (
          <p className="sch-week__detail-line">{[where, i.professor].filter(Boolean).join(" · ")}</p>
        )}
        {reason && <p className="sch-week__detail-line">{reason}</p>}
        {i.notes && <p className="sch-week__detail-line">{i.notes}</p>}
      </div>
      <button type="button" className="sch-week__detail-close" onClick={onClose} aria-label="Cerrar detalle">
        <Icon name="IconX" />
      </button>
    </aside>
  );
}
