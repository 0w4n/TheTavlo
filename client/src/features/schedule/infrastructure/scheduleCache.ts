import type { Schedule } from "../domain/schedule.entity";
import type { Subject } from "../domain/subject.entity";
import type { ClassSlot } from "../domain/classSlot.entity";
import type { OccurrenceException } from "../domain/occurrenceException.entity";
import type { AttendanceRecord } from "../domain/attendanceRecord.entity";

/**
 * A diferencia de `panelsCache.ts` (que cachea un ÁRBOL grande navegado por
 * partes), aquí el patrón es más simple porque así lo pide el diseño (§12):
 * el `Schedule` completo de un panel se suscribe entero de una vez y vive
 * en memoria durante toda la sesión — esta caché existe sobre todo para que
 * las queries puntuales del servicio (`findSchedule`, `findActiveSlotVersion`,
 * usadas antes de planificar una edición) no tengan que ir a Firestore si
 * ya tenemos el dato "gratis" gracias a un listener activo.
 *
 * `cacheKey` identifica de forma única el `Schedule` de un panel concreto:
 * `{accountType}/{userId}/panels/{panelId}/schedule`.
 */

interface CacheBucket {
  schedule: Schedule | null | undefined; // undefined = todavía no se sabe; null = se sabe que no existe
  subjects: Map<string, Subject>;
  slots: Map<string, ClassSlot>;
  exceptions: Map<string, OccurrenceException>;
  attendance: Map<string, AttendanceRecord>;
}

const buckets = new Map<string, CacheBucket>();

function getBucket(cacheKey: string): CacheBucket {
  let bucket = buckets.get(cacheKey);
  if (!bucket) {
    bucket = {
      schedule: undefined,
      subjects: new Map(),
      slots: new Map(),
      exceptions: new Map(),
      attendance: new Map(),
    };
    buckets.set(cacheKey, bucket);
  }
  return bucket;
}

export function getScheduleCacheKey(user: { accountType: string; id: string }, panelId: string): string {
  return `${user.accountType}/${user.id}/panels/${panelId}/schedule`;
}

// ─── Schedule ────────────────────────────────────────────────────────────

export function getCachedSchedule(cacheKey: string): Schedule | null | undefined {
  return getBucket(cacheKey).schedule;
}

export function setCachedSchedule(cacheKey: string, schedule: Schedule | null): void {
  getBucket(cacheKey).schedule = schedule;
}

// ─── Subjects ────────────────────────────────────────────────────────────

export function setCachedSubjects(cacheKey: string, subjects: Subject[]): void {
  const bucket = getBucket(cacheKey);
  bucket.subjects = new Map(subjects.map((s) => [s.id, s]));
}

export function getCachedSubjects(cacheKey: string): Subject[] {
  return Array.from(getBucket(cacheKey).subjects.values());
}

export function upsertCachedSubject(cacheKey: string, subject: Subject): void {
  getBucket(cacheKey).subjects.set(subject.id, subject);
}

// ─── ClassSlots ──────────────────────────────────────────────────────────

export function setCachedSlots(cacheKey: string, slots: ClassSlot[]): void {
  const bucket = getBucket(cacheKey);
  bucket.slots = new Map(slots.map((s) => [s.id, s]));
}

export function getCachedSlots(cacheKey: string): ClassSlot[] {
  return Array.from(getBucket(cacheKey).slots.values());
}

export function getCachedSlotById(cacheKey: string, id: string): ClassSlot | undefined {
  return getBucket(cacheKey).slots.get(id);
}

export function upsertCachedSlot(cacheKey: string, slot: ClassSlot): void {
  getBucket(cacheKey).slots.set(slot.id, slot);
}

/**
 * La versión de `slotGroupId` cuyo rango de vigencia cubre `week` — usada
 * por `ScheduleService.editClassSlot`/`deleteClassSlot` para construir el
 * plan de versionado sin una lectura extra a Firestore, dado que el
 * listener de `subscribeToSlotVersions` ya mantiene esto actualizado.
 */
export function getCachedActiveSlotVersion(
  cacheKey: string,
  slotGroupId: string,
  week: number,
): ClassSlot | undefined {
  return getCachedSlots(cacheKey).find(
    (s) => s.slotGroupId === slotGroupId && s.validFromWeek <= week && week <= s.validToWeek,
  );
}

// ─── Exceptions ──────────────────────────────────────────────────────────

export function setCachedExceptions(cacheKey: string, exceptions: OccurrenceException[]): void {
  const bucket = getBucket(cacheKey);
  bucket.exceptions = new Map(exceptions.map((e) => [e.id, e]));
}

export function getCachedExceptions(cacheKey: string): OccurrenceException[] {
  return Array.from(getBucket(cacheKey).exceptions.values());
}

export function upsertCachedException(cacheKey: string, exception: OccurrenceException): void {
  getBucket(cacheKey).exceptions.set(exception.id, exception);
}

// ─── Attendance ──────────────────────────────────────────────────────────

export function setCachedAttendance(cacheKey: string, records: AttendanceRecord[]): void {
  const bucket = getBucket(cacheKey);
  bucket.attendance = new Map(records.map((a) => [a.id, a]));
}

export function getCachedAttendance(cacheKey: string): AttendanceRecord[] {
  return Array.from(getBucket(cacheKey).attendance.values());
}

export function upsertCachedAttendance(cacheKey: string, record: AttendanceRecord): void {
  getBucket(cacheKey).attendance.set(record.id, record);
}

/** Limpia toda la caché de un Schedule — usar en logout / cambio de cuenta o panel. */
export function clearScheduleCache(cacheKey: string): void {
  buckets.delete(cacheKey);
}

/** Solo para tests: resetea todo el estado del módulo entre specs. */
export function __resetAllScheduleCacheForTests(): void {
  buckets.clear();
}
