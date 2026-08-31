/**
 * Helpers de fecha puros para las vistas del calendario. Sin dependencias
 * externas (no date-fns/luxon) para mantener el bundle liviano — el rango
 * de operaciones que necesitamos es acotado.
 */

export const LOCALE = "es-ES";

/** Altura en px de una hora en las vistas Semana/Día. Fuente única de verdad
 * para el grid y para el posicionamiento absoluto de los eventos. */
export const HOUR_HEIGHT_PX = 64;
export const DAY_START_HOUR = 0;
export const DAY_END_HOUR = 24;

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function addDays(date: Date, amount: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + amount);
  return d;
}

export function addMonths(date: Date, amount: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + amount);
  return d;
}

/** Lunes = 0 ... Domingo = 6 (semana estilo ES/UE). */
function mondayFirstIndex(date: Date): number {
  return (date.getDay() + 6) % 7;
}

export function startOfWeek(date: Date): Date {
  return startOfDay(addDays(date, -mondayFirstIndex(date)));
}

export function endOfWeek(date: Date): Date {
  return endOfDay(addDays(startOfWeek(date), 6));
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function endOfMonth(date: Date): Date {
  return endOfDay(new Date(date.getFullYear(), date.getMonth() + 1, 0));
}

export interface MonthGridDay {
  date: Date;
  inCurrentMonth: boolean;
}

/** Cuadrícula de 6 semanas x 7 días (42 celdas) que cubre el mes completo. */
export function getMonthGridDays(date: Date): MonthGridDay[] {
  const firstOfMonth = startOfMonth(date);
  const gridStart = startOfWeek(firstOfMonth);
  const month = date.getMonth();

  return Array.from({ length: 42 }, (_, i) => {
    const day = addDays(gridStart, i);
    return { date: day, inCurrentMonth: day.getMonth() === month };
  });
}

export function getWeekDays(date: Date): Date[] {
  const start = startOfWeek(date);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function setTimeOnDate(date: Date, hour: number, minute = 0): Date {
  const d = new Date(date);
  d.setHours(hour, minute, 0, 0);
  return d;
}

export function getMinutesFromMidnight(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

export function clampMinutesToDay(minutes: number): number {
  return Math.min(Math.max(minutes, DAY_START_HOUR * 60), DAY_END_HOUR * 60);
}

/** true si el evento toca (aunque sea parcialmente) el día dado. */
export function eventOccursOnDay(start: Date, end: Date, day: Date): boolean {
  const dayStart = startOfDay(day).getTime();
  const dayEnd = endOfDay(day).getTime();
  return start.getTime() <= dayEnd && end.getTime() >= dayStart;
}

// ─── Formatters (es-ES) ─────────────────────────────────────────────────

export function formatMonthYear(date: Date): string {
  const s = date.toLocaleDateString(LOCALE, { month: "long", year: "numeric" });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function formatWeekRangeLabel(date: Date): string {
  const start = startOfWeek(date);
  const end = endOfWeek(date);
  const sameMonth = start.getMonth() === end.getMonth();
  const startLabel = start.toLocaleDateString(LOCALE, {
    day: "numeric",
    month: sameMonth ? undefined : "short",
  });
  const endLabel = end.toLocaleDateString(LOCALE, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return `${startLabel} – ${endLabel}`;
}

export function formatFullDate(date: Date): string {
  const s = date.toLocaleDateString(LOCALE, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function formatWeekdayShort(date: Date): string {
  return date.toLocaleDateString(LOCALE, { weekday: "short" }).replace(".", "");
}

export function formatDayNumber(date: Date): string {
  return date.toLocaleDateString(LOCALE, { day: "numeric" });
}

export function formatHourLabel(hour: number): string {
  if (hour === 0) return "12 AM";
  if (hour === 12) return "12 PM";
  return hour < 12 ? `${hour} AM` : `${hour - 12} PM`;
}

export function formatTime(date: Date): string {
  return date
    .toLocaleTimeString(LOCALE, { hour: "numeric", minute: "2-digit" })
    .replace(/^0/, "");
}

export function formatTimeRange(start: Date, end: Date): string {
  return `${formatTime(start)} – ${formatTime(end)}`;
}

/** Valor para un `<input type="datetime-local">` en horario local (sin UTC shift). */
export function toDateTimeLocalValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}

export function fromDateTimeLocalValue(value: string): Date {
  // new Date("YYYY-MM-DDTHH:mm") ya se interpreta en horario local.
  return new Date(value);
}

export function toDateInputValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/**
 * Contraparte de `toDateInputValue` para un `<input type="date">`. A
 * propósito no delega en `new Date(value)`: un string "YYYY-MM-DD" a secas
 * se interpreta como medianoche UTC según el spec, lo que en cualquier
 * huso horario negativo (América) desplaza la fecha un día hacia atrás al
 * mostrarla en local. Parseamos los componentes a mano para construir la
 * fecha en horario local.
 */
export function fromDateInputValue(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}
