import type { ScheduleRepository } from "../../app/scheduleRepository.interface";
import type { Schedule } from "../../domain/schedule.entity";
import type { Subject } from "../../domain/subject.entity";
import type { ClassSlot } from "../../domain/classSlot.entity";
import type { OccurrenceException } from "../../domain/occurrenceException.entity";
import type { AttendanceRecord } from "../../domain/attendanceRecord.entity";
import { type AppErr, type ResultApp } from "#core/appCore/domain/AppCore.type";
/**
 * Implementación 100% en memoria de `ScheduleRepository`, para tests que no
 * quieren tocar Firestore de verdad. Simula la transacción de
 * `applyClassSlotChangePlan` con el mismo control de concurrencia optimista
 * que la implementación real (`findActiveSlotVersion`-style: si el
 * `status` de la versión a cerrar ya no es "active", falla como
 * `FirebaseErr` — igual que abortaría una `runTransaction` real).
 *
 * Expone `calls` para que los tests de `CachedScheduleRepository` puedan
 * afirmar cosas del tipo "la segunda lectura no generó una llamada nueva"
 * sin depender de mocks de red.
 */
export declare function createFakeScheduleRepository(seed?: {
    schedule?: Schedule;
    subjects?: Subject[];
    slots?: ClassSlot[];
    exceptions?: OccurrenceException[];
    attendance?: AttendanceRecord[];
}): {
    repository: ScheduleRepository;
    calls: {
        findSchedule: number;
        findActiveSlotVersion: number;
        createSchedule: number;
        createSubject: number;
        createClassSlot: number;
        applyClassSlotChangePlan: number;
        upsertAttendance: number;
    };
    /** Acceso directo a los stores internos — útil para setup/aserciones en tests. */
    stores: {
        subjects: Map<string, Subject>;
        slots: Map<string, ClassSlot>;
        exceptions: Map<string, OccurrenceException>;
        attendance: Map<string, AttendanceRecord>;
    };
    getSchedule: () => Schedule | null;
    spies: {
        findSchedule: import("vitest").Mock<() => Promise<ResultApp<Schedule | undefined, AppErr>>>;
        findActiveSlotVersion: import("vitest").Mock<(scheduleId: string, slotGroupId: string, week: number) => Promise<ResultApp<ClassSlot | undefined, AppErr>>>;
    };
};
