/**
 * Construye el id determinista `${slotGroupId}_${YYYY-MM-DD}` a partir de
 * la fecha en hora LOCAL (no UTC) — dos dispositivos en zonas horarias
 * distintas marcando "hoy" deben coincidir en qué día es "hoy" para ese
 * slotGroup, así que la fecha se normaliza siempre antes de construir el id
 * (ver `weekMath.toLocalDateKey`).
 */
export function buildAttendanceId(slotGroupId, localDateKey) {
    return `${slotGroupId}_${localDateKey}`;
}
