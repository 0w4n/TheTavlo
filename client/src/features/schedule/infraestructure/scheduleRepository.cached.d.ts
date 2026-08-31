import { type Unsubscribe } from "firebase/firestore";
import type { ScheduleRepository } from "../app/scheduleRepository.interface";
import type { CreateScheduleDTO, Schedule, UpdateScheduleDTO } from "../domain/schedule.entity";
import type { CreateSubjectDTO, Subject, UpdateSubjectDTO } from "../domain/subject.entity";
import type { ClassSlot, CreateClassSlotDTO } from "../domain/classSlot.entity";
import type { OccurrenceException } from "../domain/occurrenceException.entity";
import type { AttendanceRecord, UpsertAttendanceDTO } from "../domain/attendanceRecord.entity";
import type { ClassSlotChangePlan } from "../domain/classSlotVersioning";
import { type AppErr, type ResultApp } from "#core/appCore/domain/AppCore.type";
/**
 * Decorador de caché sobre cualquier `ScheduleRepository`, mismo espíritu
 * que `CachedPanelsRepository` — no sabe nada de Firestore en particular.
 *
 * A diferencia de la caché de Panels (parcial, progresiva, para un árbol
 * grande), acá el patrón es simple porque el diseño (§12) ya asume que el
 * `Schedule` completo vive en memoria vía suscripciones: esta caché sobre
 * todo evita relecturas en las queries puntuales (`findSchedule`,
 * `findActiveSlotVersion`) que el servicio dispara antes de planificar una
 * edición, y mantiene la caché correcta incluso si se llama fuera del
 * ciclo de vida de una suscripción activa (mismo criterio defensivo que
 * `CachedPanelsRepository.create`).
 */
export declare class CachedScheduleRepository implements ScheduleRepository {
    private readonly inner;
    private readonly cacheKey;
    constructor(inner: ScheduleRepository, cacheKey: string);
    subscribeToSchedule(onData: (schedule: Schedule | null) => void, onError: (err: AppErr) => void): Unsubscribe;
    subscribeToSubjects(scheduleId: string, onData: (subjects: Subject[]) => void, onError: (err: AppErr) => void): Unsubscribe;
    subscribeToSlotVersions(scheduleId: string, onData: (slots: ClassSlot[]) => void, onError: (err: AppErr) => void): Unsubscribe;
    subscribeToExceptions(scheduleId: string, onData: (exceptions: OccurrenceException[]) => void, onError: (err: AppErr) => void): Unsubscribe;
    subscribeToAttendance(scheduleId: string, onData: (records: AttendanceRecord[]) => void, onError: (err: AppErr) => void): Unsubscribe;
    findSchedule(): Promise<ResultApp<Schedule | undefined, AppErr>>;
    findActiveSlotVersion(scheduleId: string, slotGroupId: string, week: number): Promise<ResultApp<ClassSlot | undefined, AppErr>>;
    createSchedule(data: CreateScheduleDTO): Promise<ResultApp<Schedule, AppErr>>;
    updateSchedule(id: string, data: UpdateScheduleDTO): Promise<ResultApp<Schedule, AppErr>>;
    createSubject(scheduleId: string, data: CreateSubjectDTO): Promise<ResultApp<Subject, AppErr>>;
    updateSubject(scheduleId: string, id: string, data: UpdateSubjectDTO): Promise<ResultApp<Subject, AppErr>>;
    archiveSubject(scheduleId: string, id: string): Promise<ResultApp<void, AppErr>>;
    createClassSlot(scheduleId: string, data: CreateClassSlotDTO): Promise<ResultApp<ClassSlot, AppErr>>;
    applyClassSlotChangePlan(scheduleId: string, plan: ClassSlotChangePlan): Promise<ResultApp<{
        createdVersionIds: string[];
    }, AppErr>>;
    upsertAttendance(scheduleId: string, data: UpsertAttendanceDTO): Promise<ResultApp<AttendanceRecord, AppErr>>;
}
