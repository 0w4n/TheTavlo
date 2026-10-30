// Selectores PUROS de la capa de presentación de Schedule.
//
// Reciben datos ya resueltos por el dominio (`resolveWeek`) y los convierten
// en lo que necesitan los widgets: agenda del día, próxima clase, estadísticas
// de asistencia, geometría de la parrilla semanal. Sin React, sin Firestore y
// sin `new Date()` implícito — el "ahora" siempre entra como parámetro, así
// todo es determinista y testeable (ver scheduleSelectors.test.ts).

import type { Schedule } from "../../domain/schedule.entity";
import type { Subject } from "../../domain/subject.entity";
import type { ClassSlot, ClassType } from "../../domain/classSlot.entity";
import type { OccurrenceException } from "../../domain/occurrenceException.entity";
import type { ResolvedClassInstance } from "../../domain/resolvedInstance.entity";
import {
  daysBetweenCalendarDates,
  dateToWeekNumber,
  getScheduleWeekCount,
  toLocalDateKey,
} from "../../domain/weekMath";

export type IsoDay = 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type ResolveWeekFn = (week: number) => ResolvedClassInstance[];

// ─── Texto ───────────────────────────────────────────────────────────────

export const CLASS_TYPE_LABEL: Record<ClassType, string> = {
  teoria: "Teoría",
  laboratorio: "Laboratorio",
  seminario: "Seminario",
  examen: "Examen",
  tutoria: "Tutoría",
  otro: "Otra",
};

/** Inicial de cada día ISO (1 = lunes). La X de miércoles es la convención en es-ES. */
export const DAY_INITIAL: Record<IsoDay, string> = {
  1: "L",
  2: "M",
  3: "X",
  4: "J",
  5: "V",
  6: "S",
  7: "D",
};

const ES = "es-ES";

export function formatMinute(minuteOfDay: number): string {
  const h = Math.floor(minuteOfDay / 60);
  const m = minuteOfDay % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function formatTimeRange(startMinute: number, endMinute: number): string {
  return `${formatMinute(startMinute)}–${formatMinute(endMinute)}`;
}

export function formatDuration(minutes: number): string {
  const total = Math.max(0, Math.round(minutes));
  if (total < 60) return `${total} min`;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** "lunes 26 de octubre" */
export function formatDayLong(date: Date): string {
  return new Intl.DateTimeFormat(ES, {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
}

/** "26 – 30 oct" o "28 sep – 2 oct" cuando la semana cruza de mes. */
export function formatDateRange(start: Date, end: Date): string {
  const day = (d: Date) => d.getDate();
  const month = (d: Date) =>
    new Intl.DateTimeFormat(ES, { month: "short" }).format(d).replace(".", "");
  if (start.getMonth() === end.getMonth()) {
    return `${day(start)} – ${day(end)} ${month(end)}`;
  }
  return `${day(start)} ${month(start)} – ${day(end)} ${month(end)}`;
}

export function weekdayName(date: Date): string {
  return new Intl.DateTimeFormat(ES, { weekday: "long" }).format(date);
}

/** "hoy" | "mañana" | "el miércoles" | "el miércoles 4". */
export function relativeDayLabel(date: Date, now: Date): string {
  const diff = daysBetweenCalendarDates(now, date);
  if (diff === 0) return "hoy";
  if (diff === 1) return "mañana";
  if (diff > 1 && diff < 7) return `el ${weekdayName(date)}`;
  return `el ${weekdayName(date)} ${date.getDate()}`;
}

// ─── Instancias ──────────────────────────────────────────────────────────

export function isSameDay(a: Date, b: Date): boolean {
  return toLocalDateKey(a) === toLocalDateKey(b);
}

/** Inicio y fin reales (hora de pared local) de una ocurrencia resuelta. */
export function instanceBounds(instance: ResolvedClassInstance): {
  start: Date;
  end: Date;
} {
  const d = instance.date.toDate();
  const y = d.getFullYear();
  const m = d.getMonth();
  const day = d.getDate();
  return {
    start: new Date(y, m, day, 0, instance.startMinute),
    end: new Date(y, m, day, 0, instance.endMinute),
  };
}

export function instanceKey(instance: ResolvedClassInstance): string {
  return `${instance.slotGroupId}_${toLocalDateKey(instance.date.toDate())}`;
}

function sortByStart(list: ResolvedClassInstance[]): ResolvedClassInstance[] {
  return [...list].sort(
    (a, b) =>
      instanceBounds(a).start.getTime() - instanceBounds(b).start.getTime() ||
      a.endMinute - b.endMinute,
  );
}

/** ¿`date` cae dentro del periodo [startDate, endDate] del Schedule? (por día de calendario) */
export function isDateWithinSchedule(
  schedule: Pick<Schedule, "startDate" | "endDate">,
  date: Date,
): boolean {
  const key = toLocalDateKey(date);
  return (
    key >= toLocalDateKey(schedule.startDate.toDate()) &&
    key <= toLocalDateKey(schedule.endDate.toDate())
  );
}

/**
 * El resolver trabaja por semanas COMPLETAS (EC-5: la semana 1 puede ser
 * parcial) y no conoce el rango del periodo. Aquí se descartan los días
 * anteriores al inicio o posteriores al fin del Schedule.
 */
export function clipToSchedulePeriod(
  schedule: Pick<Schedule, "startDate" | "endDate">,
  instances: ResolvedClassInstance[],
): ResolvedClassInstance[] {
  const first = toLocalDateKey(schedule.startDate.toDate());
  const last = toLocalDateKey(schedule.endDate.toDate());
  return instances.filter((instance) => {
    const key = toLocalDateKey(instance.date.toDate());
    return key >= first && key <= last;
  });
}

export function getHolidayLabel(
  schedule: Pick<Schedule, "holidays">,
  date: Date,
): string | null {
  const key = toLocalDateKey(date);
  const holiday = schedule.holidays.find(
    (h) =>
      key >= toLocalDateKey(h.startDate.toDate()) &&
      key <= toLocalDateKey(h.endDate.toDate()),
  );
  return holiday ? holiday.label : null;
}

/** Clases de un día concreto. Fuera del periodo del horario no hay nada. */
export function getInstancesOn(
  resolveWeek: ResolveWeekFn,
  schedule: Pick<Schedule, "startDate" | "endDate" | "weekStartsOn">,
  date: Date,
): ResolvedClassInstance[] {
  if (!isDateWithinSchedule(schedule, date)) return [];
  const week = dateToWeekNumber(schedule, date);
  return sortByStart(
    resolveWeek(week).filter((i) => isSameDay(i.date.toDate(), date)),
  );
}

// ─── Agenda del día ──────────────────────────────────────────────────────

export type AgendaPhase = "done" | "ongoing" | "upcoming";

export interface AgendaItem {
  instance: ResolvedClassInstance;
  phase: AgendaPhase;
  /** 0..1 — solo avanza mientras la clase está en curso. */
  progress: number;
  minutesUntilStart: number;
  minutesUntilEnd: number;
}

export function buildAgenda(
  instances: ResolvedClassInstance[],
  now: Date,
): AgendaItem[] {
  const t = now.getTime();
  return instances.map((instance) => {
    const { start, end } = instanceBounds(instance);
    const phase: AgendaPhase =
      t >= end.getTime() ? "done" : t >= start.getTime() ? "ongoing" : "upcoming";
    const total = Math.max(1, end.getTime() - start.getTime());
    return {
      instance,
      phase,
      progress:
        phase === "ongoing" ? (t - start.getTime()) / total : phase === "done" ? 1 : 0,
      minutesUntilStart: Math.ceil((start.getTime() - t) / 60_000),
      minutesUntilEnd: Math.ceil((end.getTime() - t) / 60_000),
    };
  });
}

// ─── Próxima clase ───────────────────────────────────────────────────────

export interface UpcomingResult {
  /** La clase que está en curso ahora mismo, si la hay. */
  current: ResolvedClassInstance | null;
  /** Las siguientes (sin canceladas), en orden cronológico. */
  next: ResolvedClassInstance[];
}

/**
 * Recorre semana a semana desde "ahora" hasta encontrar `limit` clases por
 * venir. Se ordena por fecha real (no por `dayOfWeek`) porque con
 * `weekStartsOn = 0` el domingo (ISO 7) es el PRIMER día de su semana.
 */
export function findUpcoming(
  resolveWeek: ResolveWeekFn,
  schedule: Pick<Schedule, "startDate" | "endDate" | "weekStartsOn">,
  now: Date,
  limit = 3,
  maxWeeksAhead = 12,
): UpcomingResult {
  const result: UpcomingResult = { current: null, next: [] };
  const lastWeek = getScheduleWeekCount(schedule);
  const firstWeek = Math.max(1, dateToWeekNumber(schedule, now));
  const t = now.getTime();

  for (
    let week = firstWeek;
    week <= Math.min(lastWeek, firstWeek + maxWeeksAhead);
    week++
  ) {
    for (const instance of sortByStart(resolveWeek(week))) {
      if (instance.isCancelled) continue;
      const { start, end } = instanceBounds(instance);
      if (end.getTime() <= t) continue;
      if (start.getTime() <= t) {
        result.current ??= instance;
        continue;
      }
      result.next.push(instance);
      if (result.next.length >= limit) return result;
    }
  }
  return result;
}

// ─── Asistencia ──────────────────────────────────────────────────────────

export interface AttendanceTally {
  present: number;
  late: number;
  absent: number;
  /** Clases ya celebradas sin ningún registro de asistencia. */
  unmarked: number;
  /** Clases ya celebradas (no canceladas). */
  held: number;
}

export interface SubjectAttendance extends AttendanceTally {
  subjectId: string;
  name: string;
  color: string;
  /** 0..1, o `null` si todavía no hay ninguna clase marcada. */
  rate: number | null;
  belowThreshold: boolean;
}

export interface AttendanceSummary {
  overall: AttendanceTally & { rate: number | null; belowThreshold: boolean };
  bySubject: SubjectAttendance[];
}

const emptyTally = (): AttendanceTally => ({
  present: 0,
  late: 0,
  absent: 0,
  unmarked: 0,
  held: 0,
});

/** Un retraso cuenta como asistencia. La tasa se calcula solo sobre clases MARCADAS. */
export function attendanceRate(t: AttendanceTally): number | null {
  const marked = t.present + t.late + t.absent;
  return marked === 0 ? null : (t.present + t.late) / marked;
}

export function computeAttendance(
  resolveWeek: ResolveWeekFn,
  schedule: Pick<Schedule, "startDate" | "endDate" | "weekStartsOn">,
  subjects: Pick<Subject, "id" | "name" | "color">[],
  now: Date,
  minRate = 0.8,
): AttendanceSummary {
  const bySubjectTally = new Map<string, AttendanceTally>();
  const overall = emptyTally();
  const lastWeek = Math.min(
    getScheduleWeekCount(schedule),
    dateToWeekNumber(schedule, now),
  );

  for (let week = 1; week <= lastWeek; week++) {
    for (const instance of resolveWeek(week)) {
      if (instance.isCancelled) continue;
      if (instanceBounds(instance).end.getTime() > now.getTime()) continue;

      const tally = bySubjectTally.get(instance.subjectId) ?? emptyTally();
      const status = instance.attendance?.status;
      for (const target of [tally, overall]) {
        target.held += 1;
        if (status === "present") target.present += 1;
        else if (status === "late") target.late += 1;
        else if (status === "absent") target.absent += 1;
        else target.unmarked += 1;
      }
      bySubjectTally.set(instance.subjectId, tally);
    }
  }

  const rows: SubjectAttendance[] = subjects
    .filter((s) => bySubjectTally.has(s.id))
    .map((s) => {
      const tally = bySubjectTally.get(s.id)!;
      const rate = attendanceRate(tally);
      return {
        ...tally,
        subjectId: s.id,
        name: s.name,
        color: s.color,
        rate,
        belowThreshold: rate !== null && rate < minRate,
      };
    })
    // Primero lo que necesita atención: tasa más baja arriba, sin marcar al final.
    .sort((a, b) => {
      if (a.rate === null && b.rate === null) return a.name.localeCompare(b.name, ES);
      if (a.rate === null) return 1;
      if (b.rate === null) return -1;
      return a.rate - b.rate || a.name.localeCompare(b.name, ES);
    });

  const overallRate = attendanceRate(overall);
  return {
    overall: {
      ...overall,
      rate: overallRate,
      belowThreshold: overallRate !== null && overallRate < minRate,
    },
    bySubject: rows,
  };
}

// ─── Parrilla semanal ────────────────────────────────────────────────────

export interface GridRange {
  startMinute: number;
  endMinute: number;
}

const DEFAULT_RANGE: GridRange = { startMinute: 8 * 60, endMinute: 18 * 60 };

/**
 * Rango vertical de la parrilla. Se calcula sobre TODAS las versiones de
 * clase (y los overrides de excepciones), no sobre la semana visible: así la
 * escala no "salta" al navegar entre semanas.
 */
export function computeGridRange(
  slots: Pick<ClassSlot, "startMinute" | "endMinute">[],
  exceptions: Pick<OccurrenceException, "overrides">[] = [],
): GridRange {
  const starts: number[] = [];
  const ends: number[] = [];
  for (const s of slots) {
    starts.push(s.startMinute);
    ends.push(s.endMinute);
  }
  for (const e of exceptions) {
    if (e.overrides?.startMinute !== undefined) starts.push(e.overrides.startMinute);
    if (e.overrides?.endMinute !== undefined) ends.push(e.overrides.endMinute);
  }
  if (starts.length === 0 || ends.length === 0) return DEFAULT_RANGE;

  const startMinute = Math.floor(Math.min(...starts) / 60) * 60;
  let endMinute = Math.ceil(Math.max(...ends) / 60) * 60;
  if (endMinute - startMinute < 4 * 60) endMinute = startMinute + 4 * 60;
  return { startMinute, endMinute: Math.min(endMinute, 24 * 60) };
}

/** Días a mostrar: lunes–viernes siempre; sábado/domingo solo si alguna clase cae en ellos. */
export function getVisibleDays(
  slots: Pick<ClassSlot, "dayOfWeek">[],
  exceptions: Pick<OccurrenceException, "overrides">[],
  weekStartsOn: 1 | 0,
): IsoDay[] {
  const used = new Set<number>(slots.map((s) => s.dayOfWeek));
  for (const e of exceptions) {
    if (e.overrides?.dayOfWeek) used.add(e.overrides.dayOfWeek);
  }
  const days: IsoDay[] = [1, 2, 3, 4, 5];
  if (used.has(6)) days.push(6);
  if (used.has(7)) {
    if (weekStartsOn === 0) days.unshift(7);
    else days.push(7);
  }
  return days;
}

export interface PositionedBlock {
  instance: ResolvedClassInstance;
  /** Columna dentro de su grupo de solapes (0 = la primera). */
  lane: number;
  /** Nº de columnas del grupo de solapes al que pertenece. */
  lanes: number;
  topPct: number;
  heightPct: number;
}

/** Reparte en carriles las clases que se solapan para que se dibujen una al lado de otra. */
export function layoutDayBlocks(
  instances: ResolvedClassInstance[],
  range: GridRange,
): PositionedBlock[] {
  const total = Math.max(1, range.endMinute - range.startMinute);
  const sorted = [...instances].sort(
    (a, b) => a.startMinute - b.startMinute || a.endMinute - b.endMinute,
  );

  const positioned: PositionedBlock[] = [];
  let cluster: { instance: ResolvedClassInstance; lane: number }[] = [];
  let laneEnds: number[] = [];
  let clusterEnd = -1;

  const clamp = (n: number) => Math.min(100, Math.max(0, n));
  const flush = () => {
    const lanes = Math.max(1, laneEnds.length);
    for (const c of cluster) {
      const start = Math.max(c.instance.startMinute, range.startMinute);
      const end = Math.min(c.instance.endMinute, range.endMinute);
      positioned.push({
        instance: c.instance,
        lane: c.lane,
        lanes,
        topPct: clamp(((start - range.startMinute) / total) * 100),
        heightPct: clamp(((Math.max(end, start) - start) / total) * 100),
      });
    }
    cluster = [];
    laneEnds = [];
    clusterEnd = -1;
  };

  for (const instance of sorted) {
    if (cluster.length > 0 && instance.startMinute >= clusterEnd) flush();
    let lane = laneEnds.findIndex((end) => end <= instance.startMinute);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(instance.endMinute);
    } else {
      laneEnds[lane] = instance.endMinute;
    }
    cluster.push({ instance, lane });
    clusterEnd = Math.max(clusterEnd, instance.endMinute);
  }
  flush();

  return positioned;
}

// ─── Misc ────────────────────────────────────────────────────────────────

export function clampWeek(week: number, weekCount: number): number {
  return Math.min(Math.max(1, week), Math.max(1, weekCount));
}