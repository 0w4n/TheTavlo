import type { Timestamp } from "firebase/firestore";

export type AttendanceStatus = "present" | "absent" | "late";

/**
 * Documento en `.../schedule/{scheduleId}/attendance/{attendanceId}`.
 *
 * A diferencia de `ClassSlot`/`OccurrenceException`, NO es historial
 * versionado: el requisito de "nunca perder historial" se refiere a cómo
 * cambia el HORARIO en el tiempo (el patrón recurrente), no a los registros
 * de asistencia. Marcar asistencia es un hecho puntual que el propio
 * usuario puede corregir si se equivoca — por eso este documento SÍ admite
 * `update()` directo sobre su contenido (única excepción en toda la
 * feature, ver diseño §5/§10).
 *
 * `id` es determinista (`buildAttendanceId`) para que la operación sea un
 * upsert idempotente: reintentar un guardado tras un fallo de red nunca
 * crea un duplicado para la misma clase-fecha.
 */
export interface AttendanceRecord {
  id: string;
  slotGroupId: string;
  scheduleId: string;
  subjectId: string; // denormalizado — estadísticas por asignatura sin join
  date: Timestamp; // fecha exacta de la ocurrencia marcada
  status: AttendanceStatus;
  /** Solo tiene sentido si `status` es "absent" | "late"; opcional incluso entonces. */
  reason?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type UpsertAttendanceDTO = Omit<
  AttendanceRecord,
  "id" | "createdAt" | "updatedAt"
>;

/**
 * Construye el id determinista `${slotGroupId}_${YYYY-MM-DD}` a partir de
 * la fecha en hora LOCAL (no UTC) — dos dispositivos en zonas horarias
 * distintas marcando "hoy" deben coincidir en qué día es "hoy" para ese
 * slotGroup, así que la fecha se normaliza siempre antes de construir el id
 * (ver `weekMath.toLocalDateKey`).
 */
export function buildAttendanceId(slotGroupId: string, localDateKey: string): string {
  return `${slotGroupId}_${localDateKey}`;
}
