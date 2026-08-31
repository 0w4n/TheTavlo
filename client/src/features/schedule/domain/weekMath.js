import { Timestamp } from "firebase/firestore";
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
export function startOfDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
/** Suma (o resta, con `days` negativo) días de calendario en hora local. */
export function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}
/**
 * Diferencia en días de calendario entre dos fechas, robusta a DST: se
 * calcula sobre los componentes Y/M/D interpretados como UTC (nunca se
 * comparan los `.getTime()` de fechas locales directamente).
 */
export function daysBetweenCalendarDates(a, b) {
    const utcA = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    const utcB = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
    return Math.round((utcB - utcA) / MS_PER_DAY);
}
/** ISO: 1 = lunes ... 7 = domingo, a partir del `Date.getDay()` local (0 = domingo). */
export function isoDayOfWeek(date) {
    const jsDay = date.getDay();
    return (jsDay === 0 ? 7 : jsDay);
}
/**
 * Medianoche local del primer día de la semana que contiene `date`, según
 * `weekStartsOn` (1 = la semana empieza en lunes, 0 = empieza en domingo).
 */
export function startOfWeek(date, weekStartsOn) {
    const midnight = startOfDay(date);
    const jsDay = midnight.getDay(); // 0 = domingo ... 6 = sábado
    const daysSinceWeekStart = weekStartsOn === 1 ? (jsDay + 6) % 7 : jsDay;
    return addDays(midnight, -daysSinceWeekStart);
}
/**
 * Ancla de semanas de un `Schedule`: la medianoche local del primer día de
 * la semana que contiene `schedule.startDate`. La "semana 1" del periodo es
 * siempre la semana que contiene este ancla, aunque el periodo no empiece
 * justo en lunes (EC-5: semana parcial al inicio).
 */
export function week1Start(schedule) {
    return startOfWeek(schedule.startDate.toDate(), schedule.weekStartsOn);
}
/**
 * Nº de semana (1-indexed) del `Schedule` al que pertenece `date`. Puede
 * devolver números fuera del rango real del periodo (<1 o mayor al total
 * de semanas) — quien llame decide si eso es un error o simplemente "fuera
 * de rango, no se resuelve nada esa semana".
 */
export function dateToWeekNumber(schedule, date) {
    const anchor = week1Start(schedule);
    const targetWeekStart = startOfWeek(date, schedule.weekStartsOn);
    const diffDays = daysBetweenCalendarDates(anchor, targetWeekStart);
    return Math.floor(diffDays / 7) + 1;
}
/** Rango de fechas [inicio, fin] (ambos inclusive, medianoche local) de la semana `week` del `Schedule`. */
export function weekNumberToDateRange(schedule, week) {
    const anchor = week1Start(schedule);
    const start = addDays(anchor, (week - 1) * 7);
    const end = addDays(start, 6);
    return { start, end };
}
/** Desplazamiento en días (0-6) de `dayOfWeek` (ISO) respecto al inicio de semana configurado. */
function dayOffsetFromWeekStart(dayOfWeek, weekStartsOn) {
    if (weekStartsOn === 1)
        return dayOfWeek - 1; // lunes=0 ... domingo=6
    return dayOfWeek === 7 ? 0 : dayOfWeek; // domingo=0, lunes=1 ... sábado=6
}
/** Fecha exacta (medianoche local) de la ocurrencia "semana N, día ISO D" de un `Schedule`. */
export function weekNumberAndDayToDate(schedule, week, dayOfWeek) {
    const { start } = weekNumberToDateRange(schedule, week);
    return addDays(start, dayOffsetFromWeekStart(dayOfWeek, schedule.weekStartsOn));
}
/** Clave `YYYY-MM-DD` en hora local — usada como parte del id determinista de asistencia. */
export function toLocalDateKey(date) {
    const y = date.getFullYear();
    const m = `${date.getMonth() + 1}`.padStart(2, "0");
    const d = `${date.getDate()}`.padStart(2, "0");
    return `${y}-${m}-${d}`;
}
export function timestampToLocalDateKey(timestamp) {
    return toLocalDateKey(timestamp.toDate());
}
/** Total de semanas (1-indexed, inclusive) que abarca el periodo completo del Schedule. */
export function getScheduleWeekCount(schedule) {
    return dateToWeekNumber(schedule, schedule.endDate.toDate());
}
/**
 * Comprueba si `date` cae dentro de algún festivo/vacación del `Schedule`
 * (comparación por día de calendario, ignorando la hora).
 */
export function isHoliday(schedule, date) {
    const key = toLocalDateKey(date);
    return schedule.holidays.some((holiday) => {
        const startKey = toLocalDateKey(holiday.startDate.toDate());
        const endKey = toLocalDateKey(holiday.endDate.toDate());
        return key >= startKey && key <= endKey;
    });
}
