import { type Firestore, type Unsubscribe } from "firebase/firestore";
import type { ScheduleRepository } from "../app/scheduleRepository.interface";
import type { CreateScheduleDTO, Schedule, UpdateScheduleDTO } from "../domain/schedule.entity";
import type { CreateSubjectDTO, Subject, UpdateSubjectDTO } from "../domain/subject.entity";
import type { ClassSlot, CreateClassSlotDTO } from "../domain/classSlot.entity";
import type { OccurrenceException } from "../domain/occurrenceException.entity";
import type { AttendanceRecord, UpsertAttendanceDTO } from "../domain/attendanceRecord.entity";
import type { ClassSlotChangePlan } from "../domain/classSlotVersioning";
import type { GlobalContextValue } from "#core/globalContext/context/globalContext";
import { type AppErr, type ResultApp } from "#core/appCore/domain/AppCore.type";
export declare class FirebaseScheduleRepository implements ScheduleRepository {
    private firestore;
    private getCurrentContext;
    constructor(firestore: Firestore, getCurrentContext: () => GlobalContextValue);
    private getContext;
    private getPanelPath;
    private getPanelRef;
    private getScheduleCollectionPath;
    private getSubjectsPath;
    private getSlotVersionsPath;
    private getExceptionsPath;
    private getAttendancePath;
    private scheduleCollectionRef;
    private subjectsCollectionRef;
    private slotVersionsCollectionRef;
    private exceptionsCollectionRef;
    private attendanceCollectionRef;
    subscribeToSchedule(onData: (schedule: Schedule | null) => void, onError: (err: AppErr) => void): Unsubscribe;
    subscribeToSubjects(scheduleId: string, onData: (subjects: Subject[]) => void, onError: (err: AppErr) => void): Unsubscribe;
    subscribeToSlotVersions(scheduleId: string, onData: (slots: ClassSlot[]) => void, onError: (err: AppErr) => void): Unsubscribe;
    subscribeToExceptions(scheduleId: string, onData: (exceptions: OccurrenceException[]) => void, onError: (err: AppErr) => void): Unsubscribe;
    subscribeToAttendance(scheduleId: string, onData: (records: AttendanceRecord[]) => void, onError: (err: AppErr) => void): Unsubscribe;
    findSchedule(): Promise<ResultApp<Schedule | undefined, AppErr>>;
    /**
     * Requiere un índice compuesto sobre `slotVersions`:
     * `slotGroupId ASC, validFromWeek ASC, validToWeek ASC` (ver diseño §10).
     */
    findActiveSlotVersion(scheduleId: string, slotGroupId: string, week: number): Promise<ResultApp<ClassSlot | undefined, AppErr>>;
    createSchedule(data: CreateScheduleDTO): Promise<ResultApp<Schedule, AppErr>>;
    updateSchedule(id: string, data: UpdateScheduleDTO): Promise<ResultApp<Schedule, AppErr>>;
    createSubject(scheduleId: string, data: CreateSubjectDTO): Promise<ResultApp<Subject, AppErr>>;
    updateSubject(scheduleId: string, id: string, data: UpdateSubjectDTO): Promise<ResultApp<Subject, AppErr>>;
    archiveSubject(scheduleId: string, id: string): Promise<ResultApp<void, AppErr>>;
    createClassSlot(scheduleId: string, data: CreateClassSlotDTO): Promise<ResultApp<ClassSlot, AppErr>>;
    /**
     * Ejecuta el plan de versionado dentro de una `runTransaction`: relee la
     * versión a cerrar DENTRO de la transacción y verifica que su `status`
     * siga siendo "active" — si otro dispositivo ya la cerró entretanto
     * (EC-12), la transacción aborta y Firestore la reintenta automáticamente
     * contra el estado más reciente un número limitado de veces antes de
     * rendirse; si sigue en conflicto, propagamos el error tal cual para que
     * la capa de presentación ofrezca "ver cambios / reintentar" (Flujo C, §8).
     */
    applyClassSlotChangePlan(scheduleId: string, plan: ClassSlotChangePlan): Promise<ResultApp<{
        createdVersionIds: string[];
    }, AppErr>>;
    upsertAttendance(scheduleId: string, data: UpsertAttendanceDTO): Promise<ResultApp<AttendanceRecord, AppErr>>;
}
