import type { Schedule } from "../domain/schedule.entity";
import type { Subject } from "../domain/subject.entity";
import type { ClassSlot } from "../domain/classSlot.entity";
import type { OccurrenceException } from "../domain/occurrenceException.entity";
import type { AttendanceRecord } from "../domain/attendanceRecord.entity";
export declare function getScheduleCacheKey(user: {
    accountType: string;
    id: string;
}, panelId: string): string;
export declare function getCachedSchedule(cacheKey: string): Schedule | null | undefined;
export declare function setCachedSchedule(cacheKey: string, schedule: Schedule | null): void;
export declare function setCachedSubjects(cacheKey: string, subjects: Subject[]): void;
export declare function getCachedSubjects(cacheKey: string): Subject[];
export declare function upsertCachedSubject(cacheKey: string, subject: Subject): void;
export declare function setCachedSlots(cacheKey: string, slots: ClassSlot[]): void;
export declare function getCachedSlots(cacheKey: string): ClassSlot[];
export declare function getCachedSlotById(cacheKey: string, id: string): ClassSlot | undefined;
export declare function upsertCachedSlot(cacheKey: string, slot: ClassSlot): void;
/**
 * La versión de `slotGroupId` cuyo rango de vigencia cubre `week` — usada
 * por `ScheduleService.editClassSlot`/`deleteClassSlot` para construir el
 * plan de versionado sin una lectura extra a Firestore, dado que el
 * listener de `subscribeToSlotVersions` ya mantiene esto actualizado.
 */
export declare function getCachedActiveSlotVersion(cacheKey: string, slotGroupId: string, week: number): ClassSlot | undefined;
export declare function setCachedExceptions(cacheKey: string, exceptions: OccurrenceException[]): void;
export declare function getCachedExceptions(cacheKey: string): OccurrenceException[];
export declare function upsertCachedException(cacheKey: string, exception: OccurrenceException): void;
export declare function setCachedAttendance(cacheKey: string, records: AttendanceRecord[]): void;
export declare function getCachedAttendance(cacheKey: string): AttendanceRecord[];
export declare function upsertCachedAttendance(cacheKey: string, record: AttendanceRecord): void;
/** Limpia toda la caché de un Schedule — usar en logout / cambio de cuenta o panel. */
export declare function clearScheduleCache(cacheKey: string): void;
/** Solo para tests: resetea todo el estado del módulo entre specs. */
export declare function __resetAllScheduleCacheForTests(): void;
