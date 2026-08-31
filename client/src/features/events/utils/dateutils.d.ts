/**
 * Helpers de fecha puros para las vistas del calendario. Sin dependencias
 * externas (no date-fns/luxon) para mantener el bundle liviano — el rango
 * de operaciones que necesitamos es acotado.
 */
export declare const LOCALE = "es-ES";
/** Altura en px de una hora en las vistas Semana/Día. Fuente única de verdad
 * para el grid y para el posicionamiento absoluto de los eventos. */
export declare const HOUR_HEIGHT_PX = 64;
export declare const DAY_START_HOUR = 0;
export declare const DAY_END_HOUR = 24;
export declare function isSameDay(a: Date, b: Date): boolean;
export declare function isToday(date: Date): boolean;
export declare function startOfDay(date: Date): Date;
export declare function endOfDay(date: Date): Date;
export declare function addDays(date: Date, amount: number): Date;
export declare function addMonths(date: Date, amount: number): Date;
export declare function startOfWeek(date: Date): Date;
export declare function endOfWeek(date: Date): Date;
export declare function startOfMonth(date: Date): Date;
export declare function endOfMonth(date: Date): Date;
export interface MonthGridDay {
    date: Date;
    inCurrentMonth: boolean;
}
/** Cuadrícula de 6 semanas x 7 días (42 celdas) que cubre el mes completo. */
export declare function getMonthGridDays(date: Date): MonthGridDay[];
export declare function getWeekDays(date: Date): Date[];
export declare function setTimeOnDate(date: Date, hour: number, minute?: number): Date;
export declare function getMinutesFromMidnight(date: Date): number;
export declare function clampMinutesToDay(minutes: number): number;
/** true si el evento toca (aunque sea parcialmente) el día dado. */
export declare function eventOccursOnDay(start: Date, end: Date, day: Date): boolean;
export declare function formatMonthYear(date: Date): string;
export declare function formatWeekRangeLabel(date: Date): string;
export declare function formatFullDate(date: Date): string;
export declare function formatWeekdayShort(date: Date): string;
export declare function formatDayNumber(date: Date): string;
export declare function formatHourLabel(hour: number): string;
export declare function formatTime(date: Date): string;
export declare function formatTimeRange(start: Date, end: Date): string;
/** Valor para un `<input type="datetime-local">` en horario local (sin UTC shift). */
export declare function toDateTimeLocalValue(date: Date): string;
export declare function fromDateTimeLocalValue(value: string): Date;
export declare function toDateInputValue(date: Date): string;
/**
 * Contraparte de `toDateInputValue` para un `<input type="date">`. A
 * propósito no delega en `new Date(value)`: un string "YYYY-MM-DD" a secas
 * se interpreta como medianoche UTC según el spec, lo que en cualquier
 * huso horario negativo (América) desplaza la fecha un día hacia atrás al
 * mostrarla en local. Parseamos los componentes a mano para construir la
 * fecha en horario local.
 */
export declare function fromDateInputValue(value: string): Date;
