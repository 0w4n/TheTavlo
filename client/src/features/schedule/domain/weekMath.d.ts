import { Timestamp } from "firebase/firestore";
import type { Schedule } from "./schedule.entity";
/** Medianoche local del mismo día que `date`. */
export declare function startOfDay(date: Date): Date;
/** Suma (o resta, con `days` negativo) días de calendario en hora local. */
export declare function addDays(date: Date, days: number): Date;
/**
 * Diferencia en días de calendario entre dos fechas, robusta a DST: se
 * calcula sobre los componentes Y/M/D interpretados como UTC (nunca se
 * comparan los `.getTime()` de fechas locales directamente).
 */
export declare function daysBetweenCalendarDates(a: Date, b: Date): number;
/** ISO: 1 = lunes ... 7 = domingo, a partir del `Date.getDay()` local (0 = domingo). */
export declare function isoDayOfWeek(date: Date): 1 | 2 | 3 | 4 | 5 | 6 | 7;
/**
 * Medianoche local del primer día de la semana que contiene `date`, según
 * `weekStartsOn` (1 = la semana empieza en lunes, 0 = empieza en domingo).
 */
export declare function startOfWeek(date: Date, weekStartsOn: 1 | 0): Date;
/**
 * Ancla de semanas de un `Schedule`: la medianoche local del primer día de
 * la semana que contiene `schedule.startDate`. La "semana 1" del periodo es
 * siempre la semana que contiene este ancla, aunque el periodo no empiece
 * justo en lunes (EC-5: semana parcial al inicio).
 */
export declare function week1Start(schedule: Pick<Schedule, "startDate" | "weekStartsOn">): Date;
/**
 * Nº de semana (1-indexed) del `Schedule` al que pertenece `date`. Puede
 * devolver números fuera del rango real del periodo (<1 o mayor al total
 * de semanas) — quien llame decide si eso es un error o simplemente "fuera
 * de rango, no se resuelve nada esa semana".
 */
export declare function dateToWeekNumber(schedule: Pick<Schedule, "startDate" | "weekStartsOn">, date: Date): number;
/** Rango de fechas [inicio, fin] (ambos inclusive, medianoche local) de la semana `week` del `Schedule`. */
export declare function weekNumberToDateRange(schedule: Pick<Schedule, "startDate" | "weekStartsOn">, week: number): {
    start: Date;
    end: Date;
};
/** Fecha exacta (medianoche local) de la ocurrencia "semana N, día ISO D" de un `Schedule`. */
export declare function weekNumberAndDayToDate(schedule: Pick<Schedule, "startDate" | "weekStartsOn">, week: number, dayOfWeek: 1 | 2 | 3 | 4 | 5 | 6 | 7): Date;
/** Clave `YYYY-MM-DD` en hora local — usada como parte del id determinista de asistencia. */
export declare function toLocalDateKey(date: Date): string;
export declare function timestampToLocalDateKey(timestamp: Timestamp): string;
/** Total de semanas (1-indexed, inclusive) que abarca el periodo completo del Schedule. */
export declare function getScheduleWeekCount(schedule: Pick<Schedule, "startDate" | "endDate" | "weekStartsOn">): number;
/**
 * Comprueba si `date` cae dentro de algún festivo/vacación del `Schedule`
 * (comparación por día de calendario, ignorando la hora).
 */
export declare function isHoliday(schedule: Pick<Schedule, "holidays">, date: Date): boolean;
