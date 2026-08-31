import type { Unsubscribe } from "firebase/firestore";
import { type AppErr, type ResultApp } from "#core/appCore/domain/AppCore.type";
import type { CreateScheduleDTO, Schedule, UpdateScheduleDTO } from "../domain/schedule.entity";
import type { CreateSubjectDTO, Subject, UpdateSubjectDTO } from "../domain/subject.entity";
import type { ClassSlot, ClassSlotContent, CreateClassSlotDTO } from "../domain/classSlot.entity";
import type { OccurrenceException } from "../domain/occurrenceException.entity";
import type { AttendanceRecord, UpsertAttendanceDTO } from "../domain/attendanceRecord.entity";
import type { EditScope } from "../domain/editScope.type";
import { type ResolveWeekInput } from "../domain/scheduleResolver";
import type { ResolvedClassInstance } from "../domain/resolvedInstance.entity";
import type { ScheduleRepository } from "./scheduleRepository.interface";
export declare class ScheduleService {
    private repository;
    constructor(repository: ScheduleRepository);
    subscribeToSchedule(onData: (schedule: Schedule | null) => void, onError: (err: AppErr) => void): Unsubscribe;
    subscribeToSubjects(scheduleId: string, onData: (subjects: Subject[]) => void, onError: (err: AppErr) => void): Unsubscribe;
    subscribeToSlotVersions(scheduleId: string, onData: (slots: ClassSlot[]) => void, onError: (err: AppErr) => void): Unsubscribe;
    subscribeToExceptions(scheduleId: string, onData: (exceptions: OccurrenceException[]) => void, onError: (err: AppErr) => void): Unsubscribe;
    subscribeToAttendance(scheduleId: string, onData: (records: AttendanceRecord[]) => void, onError: (err: AppErr) => void): Unsubscribe;
    /**
     * `resolveWeek.useCase.ts` del diseño §4: no toca el repositorio, opera
     * sobre los datos que ya trajeron las suscripciones. Incluye el segundo
     * paso de detección de conflictos (§16) para no obligar a cada consumidor
     * a acordarse de encadenarlo.
     */
    resolveWeek(input: ResolveWeekInput): ResolvedClassInstance[];
    getSchedule(): Promise<ResultApp<Schedule | undefined, AppErr>>;
    createSchedule(data: CreateScheduleDTO): Promise<ResultApp<Schedule, AppErr>>;
    updateSchedule(id: string, data: UpdateScheduleDTO): Promise<ResultApp<Schedule, AppErr>>;
    createSubject(scheduleId: string, data: CreateSubjectDTO): Promise<ResultApp<Subject, AppErr>>;
    updateSubject(scheduleId: string, id: string, data: UpdateSubjectDTO): Promise<ResultApp<Subject, AppErr>>;
    archiveSubject(scheduleId: string, id: string): Promise<ResultApp<void, AppErr>>;
    createClassSlot(scheduleId: string, data: CreateClassSlotDTO): Promise<ResultApp<ClassSlot, AppErr>>;
    /**
     * Orquesta el flujo completo de `EditScopeDialog` (diseño §7.3): busca la
     * versión activa para `week`, valida la precondición y el propio scope,
     * delega en `planClassSlotEdit` (dominio, puro) la decisión de QUÉ
     * escribir, y le pide al repositorio que lo ejecute de forma atómica.
     */
    editClassSlot(params: {
        schedule: Pick<Schedule, "startDate" | "weekStartsOn">;
        scheduleId: string;
        slotGroupId: string;
        week: number;
        scope: EditScope;
        changes: Partial<ClassSlotContent>;
    }): Promise<ResultApp<{
        createdVersionIds: string[];
    }, AppErr>>;
    deleteClassSlot(params: {
        schedule: Pick<Schedule, "startDate" | "weekStartsOn">;
        scheduleId: string;
        slotGroupId: string;
        week: number;
        scope: EditScope;
    }): Promise<ResultApp<{
        createdVersionIds: string[];
    }, AppErr>>;
    private applyPlan;
    markAttendance(scheduleId: string, data: UpsertAttendanceDTO): Promise<ResultApp<AttendanceRecord, AppErr>>;
}
