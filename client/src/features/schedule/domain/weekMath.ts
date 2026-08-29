import { Timestamp } from "firebase/firestore";
import type { Schedule } from "./schedule.entity";

/**
 * Todo el cálculo de semanas se hace en HORA LOCAL DEL DISPOSITIVO, nunca en
 * UTC (ver diseño EC-4): un horario académico es "hora de pared", no un
 * instante absoluto. Si el usuario viaja de huso horario a mitad de curso,
 * "los martes a las 9" debe seguir siendo a las 9 de la hora local actual.
 *
 * Para evitar que las restas de fechas se corrompan por saltos de horario
 * de verano (DST), toda diferencia en días se calcula normalizando cada
 * fecha a un timestamp UTC construido a partir de sus componentes de
 * calendario locales (año/mes/día) — ver `daysBetweenCalendarDates` — en
 * vez de restar directamente los `.getTime()` de dos `Date` locales.
 */

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Medianoche local del mismo día que `date`. */
export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Suma (o resta, con `days` negativo) días de calendario en hora local. */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Diferencia en días de calendario entre dos fechas, robusta a DST: se
 * calcula sobre los componentes Y/M/D interpretados como UTC (nunca se
 * comparan los `.getTime()` de fechas locales directamente).
 */
export function daysBetweenCalendarDates(a: Date, b: Date): number {
  const utcA = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utcB = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((utcB - utcA) / MS_PER_DAY);
}

/** ISO: 1 = lunes ... 7 = domingo, a partir del `Date.getDay()` local (0 = domingo). */
export function isoDayOfWeek(date: Date): 1 | 2 | 3 | 4 | 5 | 6 | 7 {
  const jsDay = date.getDay();
  return (jsDay === 0 ? 7 : jsDay) as 1 | 2 | 3 | 4 | 5 | 6 | 7;
}

/**
 * Medianoche local del primer día de la semana que contiene `date`, según
 * `weekStartsOn` (1 = la semana empieza en lunes, 0 = empieza en domingo).
 */
export function startOfWeek(date: Date, weekStartsOn: 1 | 0): Date {
  const midnight = startOfDay(date);
  const jsDay = midnight.getDay(); // 0 = domingo ... 6 = sábado
  const daysSinceWeekStart =
    weekStartsOn === 1 ? (jsDay + 6) % 7 : jsDay;
  return addDays(midnight, -daysSinceWeekStart);
}

/**
 * Ancla de semanas de un `Schedule`: la medianoche local del primer día de
 * la semana que contiene `schedule.startDate`. La "semana 1" del periodo es
 * siempre la semana que contiene este ancla, aunque el periodo no empiece
 * justo en lunes (EC-5: semana parcial al inicio).
 */
export function week1Start(schedule: Pick<Schedule, "startDate" | "weekStartsOn">): Date {
  return startOfWeek(schedule.startDate.toDate(), schedule.weekStartsOn);
}

/**
 * Nº de semana (1-indexed) del `Schedule` al que pertenece `date`. Puede
 * devolver números fuera del rango real del periodo (<1 o mayor al total
 * de semanas) — quien llame decide si eso es un error o simplemente "fuera
 * de rango, no se resuelve nada esa semana".
 */
export function dateToWeekNumber(
  schedule: Pick<Schedule, "startDate" | "weekStartsOn">,
  date: Date,
): number {
  const anchor = week1Start(schedule);
  const targetWeekStart = startOfWeek(date, schedule.weekStartsOn);
  const diffDays = daysBetweenCalendarDates(anchor, targetWeekStart);
  return Math.floor(diffDays / 7) + 1;
}

/** Rango de fechas [inicio, fin] (ambos inclusive, medianoche local) de la semana `week` del `Schedule`. */
export function weekNumberToDateRange(
  schedule: Pick<Schedule, "startDate" | "weekStartsOn">,
  week: number,
): { start: Date; end: Date } {
  const anchor = week1Start(schedule);
  const start = addDays(anchor, (week - 1) * 7);
  const end = addDays(start, 6);
  return { start, end };
}

/** Desplazamiento en días (0-6) de `dayOfWeek` (ISO) respecto al inicio de semana configurado. */
function dayOffsetFromWeekStart(
  dayOfWeek: 1 | 2 | 3 | 4 | 5 | 6 | 7,
  weekStartsOn: 1 | 0,
): number {
  if (weekStartsOn === 1) return dayOfWeek - 1; // lunes=0 ... domingo=6
  return dayOfWeek === 7 ? 0 : dayOfWeek; // domingo=0, lunes=1 ... sábado=6
}

/** Fecha exacta (medianoche local) de la ocurrencia "semana N, día ISO D" de un `Schedule`. */
export function weekNumberAndDayToDate(
  schedule: Pick<Schedule, "startDate" | "weekStartsOn">,
  week: number,
  dayOfWeek: 1 | 2 | 3 | 4 | 5 | 6 | 7,
): Date {
  const { start } = weekNumberToDateRange(schedule, week);
  return addDays(start, dayOffsetFromWeekStart(dayOfWeek, schedule.weekStartsOn));
}

/** Clave `YYYY-MM-DD` en hora local — usada como parte del id determinista de asistencia. */
export function toLocalDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function timestampToLocalDateKey(timestamp: Timestamp): string {
  return toLocalDateKey(timestamp.toDate());
}

/** Total de semanas (1-indexed, inclusive) que abarca el periodo completo del Schedule. */
export function getScheduleWeekCount(
  schedule: Pick<Schedule, "startDate" | "endDate" | "weekStartsOn">,
): number {
  return dateToWeekNumber(schedule, schedule.endDate.toDate());
}

/**
 * Comprueba si `date` cae dentro de algún festivo/vacación del `Schedule`
 * (comparación por día de calendario, ignorando la hora).
 */
export function isHoliday(
  schedule: Pick<Schedule, "holidays">,
  date: Date,
): boolean {
  const key = toLocalDateKey(date);
  return schedule.holidays.some((holiday) => {
    const startKey = toLocalDateKey(holiday.startDate.toDate());
    const endKey = toLocalDateKey(holiday.endDate.toDate());
    return key >= startKey && key <= endKey;
  });
}
