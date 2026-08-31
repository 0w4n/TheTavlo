import type { Unsubscribe } from "firebase/firestore";
import type { AppErr, ResultApp } from "#core/appCore/domain/AppCore.type";
import type { CreateScheduleDTO, Schedule, UpdateScheduleDTO } from "../domain/schedule.entity";
import type { CreateSubjectDTO, Subject, UpdateSubjectDTO } from "../domain/subject.entity";
import type { ClassSlot, CreateClassSlotDTO } from "../domain/classSlot.entity";
import type { OccurrenceException } from "../domain/occurrenceException.entity";
import type { AttendanceRecord, UpsertAttendanceDTO } from "../domain/attendanceRecord.entity";
import type { ClassSlotChangePlan } from "../domain/classSlotVersioning";

/**
 * Todo lo que cuelga de un `Schedule` (subjects/slots/exceptions/attendance)
 * necesita su `scheduleId` explícito en cada llamada — a propósito no se
 * resuelve "por dentro" del repositorio de forma async, porque eso sería
 * un problema para las suscripciones en tiempo real (no se puede `await`
 * limpiamente antes de devolver un `Unsubscribe` síncrono). El flujo real
 * (capa de presentación, próxima iteración) es de dos fases: primero
 * `subscribeToSchedule`, y en cuanto se conoce `schedule.id`, recién ahí se
 * arrancan las otras cuatro suscripciones con ese id.
 */
export interface ScheduleRepository {
  // ─── Suscripciones — el Schedule completo se carga entero en memoria una
  // vez por sesión (diseño §12): navegar entre semanas nunca dispara una
  // lectura nueva, solo re-ejecuta el resolver sobre estos datos. ──────────

  /** Escucha el (a lo sumo un) Schedule del panel actual. `null` = el panel todavía no tiene horario. */
  subscribeToSchedule(
    onData: (schedule: Schedule | null) => void,
    onError: (err: AppErr) => void,
  ): Unsubscribe;

  subscribeToSubjects(
    scheduleId: string,
    onData: (subjects: Subject[]) => void,
    onError: (err: AppErr) => void,
  ): Unsubscribe;

  /** Trae TODAS las versiones, activas y superseded (el historial completo — ver diseño §14). */
  subscribeToSlotVersions(
    scheduleId: string,
    onData: (slots: ClassSlot[]) => void,
    onError: (err: AppErr) => void,
  ): Unsubscribe;

  subscribeToExceptions(
    scheduleId: string,
    onData: (exceptions: OccurrenceException[]) => void,
    onError: (err: AppErr) => void,
  ): Unsubscribe;

  subscribeToAttendance(
    scheduleId: string,
    onData: (records: AttendanceRecord[]) => void,
    onError: (err: AppErr) => void,
  ): Unsubscribe;

  // ─── Queries puntuales ────────────────────────────────────────────────────

  findSchedule(): Promise<ResultApp<Schedule | undefined, AppErr>>;

  /**
   * La versión de `slotGroupId` cuyo rango de vigencia cubre `week` —
   * precondición de `editClassSlot`/`deleteClassSlot`. A propósito NO
   * filtra por `status`: si `week` es una semana ya pasada, la versión que
   * la cubre puede estar `superseded` (fue cerrada por una edición
   * posterior) y aun así es la correcta para, por ejemplo, editar
   * retroactivamente "solo ese día" (ver diseño §14 — el resolver tampoco
   * filtra por status, solo por rango).
   */
  findActiveSlotVersion(
    scheduleId: string,
    slotGroupId: string,
    week: number,
  ): Promise<ResultApp<ClassSlot | undefined, AppErr>>;

  // ─── Mutaciones ──────────────────────────────────────────────────────────

  /** Falla con `ValidationErr` si el panel actual YA tiene un Schedule (regla de negocio: 0 o 1 por panel). */
  createSchedule(data: CreateScheduleDTO): Promise<ResultApp<Schedule, AppErr>>;
  updateSchedule(
    id: string,
    data: UpdateScheduleDTO,
  ): Promise<ResultApp<Schedule, AppErr>>;

  createSubject(
    scheduleId: string,
    data: CreateSubjectDTO,
  ): Promise<ResultApp<Subject, AppErr>>;
  updateSubject(
    scheduleId: string,
    id: string,
    data: UpdateSubjectDTO,
  ): Promise<ResultApp<Subject, AppErr>>;
  archiveSubject(scheduleId: string, id: string): Promise<ResultApp<void, AppErr>>;

  /**
   * Crea la PRIMERA versión de un `slotGroupId` nuevo (Flujo A del diseño
   * §8): no hay nada que cerrar todavía, así que no pasa por
   * `applyClassSlotChangePlan` — es un `create` simple, con
   * `editReason: "initial"`.
   */
  createClassSlot(
    scheduleId: string,
    data: CreateClassSlotDTO,
  ): Promise<ResultApp<ClassSlot, AppErr>>;

  /**
   * Ejecuta un plan producido por `planClassSlotEdit`/`planClassSlotDeletion`
   * (diseño §14/§16): si es una excepción, un simple `create`; si es
   * versionado, una transacción atómica que (a) verifica que la versión a
   * cerrar SIGUE activa (control de concurrencia optimista — si otro
   * dispositivo ya la cerró, la transacción aborta con un error de
   * conflicto) y (b) cierra esa versión + crea las nuevas, todo o nada.
   */
  applyClassSlotChangePlan(
    scheduleId: string,
    plan: ClassSlotChangePlan,
  ): Promise<ResultApp<{ createdVersionIds: string[] }, AppErr>>;

  /** Upsert directo — única mutación de la feature que SÍ sobreescribe contenido (ver diseño §5, EC-16). */
  upsertAttendance(
    scheduleId: string,
    data: UpsertAttendanceDTO,
  ): Promise<ResultApp<AttendanceRecord, AppErr>>;
}
