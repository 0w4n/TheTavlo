import { Timestamp, type Unsubscribe } from "firebase/firestore";
import type { ScheduleRepository } from "../app/scheduleRepository.interface";
import type { CreateScheduleDTO, Schedule, UpdateScheduleDTO } from "../domain/schedule.entity";
import type { CreateSubjectDTO, Subject, UpdateSubjectDTO } from "../domain/subject.entity";
import type { ClassSlot, CreateClassSlotDTO } from "../domain/classSlot.entity";
import type { OccurrenceException } from "../domain/occurrenceException.entity";
import type { AttendanceRecord, UpsertAttendanceDTO } from "../domain/attendanceRecord.entity";
import type { ClassSlotChangePlan } from "../domain/classSlotVersioning";
import { isOk, type AppErr, type ResultApp } from "#core/appCore/domain/AppCore.type";
import {
  getCachedActiveSlotVersion,
  getCachedSchedule,
  getCachedSlotById,
  setCachedAttendance,
  setCachedExceptions,
  setCachedSchedule,
  setCachedSlots,
  setCachedSubjects,
  upsertCachedAttendance,
  upsertCachedException,
  upsertCachedSlot,
  upsertCachedSubject,
} from "./scheduleCache";

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
export class CachedScheduleRepository implements ScheduleRepository {
  constructor(
    private readonly inner: ScheduleRepository,
    private readonly cacheKey: string,
  ) {}

  // ─── Suscripciones — pasan siempre por la fuente real, alimentando la
  // caché con cada emisión del listener ────────────────────────────────────

  subscribeToSchedule(
    onData: (schedule: Schedule | null) => void,
    onError: (err: AppErr) => void,
  ): Unsubscribe {
    return this.inner.subscribeToSchedule((schedule) => {
      setCachedSchedule(this.cacheKey, schedule);
      onData(schedule);
    }, onError);
  }

  subscribeToSubjects(
    scheduleId: string,
    onData: (subjects: Subject[]) => void,
    onError: (err: AppErr) => void,
  ): Unsubscribe {
    return this.inner.subscribeToSubjects(
      scheduleId,
      (subjects) => {
        setCachedSubjects(this.cacheKey, subjects);
        onData(subjects);
      },
      onError,
    );
  }

  subscribeToSlotVersions(
    scheduleId: string,
    onData: (slots: ClassSlot[]) => void,
    onError: (err: AppErr) => void,
  ): Unsubscribe {
    return this.inner.subscribeToSlotVersions(
      scheduleId,
      (slots) => {
        setCachedSlots(this.cacheKey, slots);
        onData(slots);
      },
      onError,
    );
  }

  subscribeToExceptions(
    scheduleId: string,
    onData: (exceptions: OccurrenceException[]) => void,
    onError: (err: AppErr) => void,
  ): Unsubscribe {
    return this.inner.subscribeToExceptions(
      scheduleId,
      (exceptions) => {
        setCachedExceptions(this.cacheKey, exceptions);
        onData(exceptions);
      },
      onError,
    );
  }

  subscribeToAttendance(
    scheduleId: string,
    onData: (records: AttendanceRecord[]) => void,
    onError: (err: AppErr) => void,
  ): Unsubscribe {
    return this.inner.subscribeToAttendance(
      scheduleId,
      (records) => {
        setCachedAttendance(this.cacheKey, records);
        onData(records);
      },
      onError,
    );
  }

  // ─── Queries puntuales ────────────────────────────────────────────────────

  async findSchedule(): Promise<ResultApp<Schedule | undefined, AppErr>> {
    const cached = getCachedSchedule(this.cacheKey);
    if (cached !== undefined) return { success: true, value: cached ?? undefined };

    const result = await this.inner.findSchedule();
    if (isOk(result)) setCachedSchedule(this.cacheKey, result.value ?? null);
    return result;
  }

  async findActiveSlotVersion(
    scheduleId: string,
    slotGroupId: string,
    week: number,
  ): Promise<ResultApp<ClassSlot | undefined, AppErr>> {
    const cached = getCachedActiveSlotVersion(this.cacheKey, slotGroupId, week);
    if (cached) return { success: true, value: cached };

    return this.inner.findActiveSlotVersion(scheduleId, slotGroupId, week);
  }

  // ─── Mutaciones — escriben en la fuente real y reflejan el resultado en
  // caché de inmediato, sin depender de que haya una suscripción activa ────

  async createSchedule(data: CreateScheduleDTO): Promise<ResultApp<Schedule, AppErr>> {
    const result = await this.inner.createSchedule(data);
    if (isOk(result)) setCachedSchedule(this.cacheKey, result.value);
    return result;
  }

  async updateSchedule(
    id: string,
    data: UpdateScheduleDTO,
  ): Promise<ResultApp<Schedule, AppErr>> {
    const result = await this.inner.updateSchedule(id, data);
    if (isOk(result)) setCachedSchedule(this.cacheKey, result.value);
    return result;
  }

  async createSubject(
    scheduleId: string,
    data: CreateSubjectDTO,
  ): Promise<ResultApp<Subject, AppErr>> {
    const result = await this.inner.createSubject(scheduleId, data);
    if (isOk(result)) upsertCachedSubject(this.cacheKey, result.value);
    return result;
  }

  async updateSubject(
    scheduleId: string,
    id: string,
    data: UpdateSubjectDTO,
  ): Promise<ResultApp<Subject, AppErr>> {
    const result = await this.inner.updateSubject(scheduleId, id, data);
    if (isOk(result)) upsertCachedSubject(this.cacheKey, result.value);
    return result;
  }

  async archiveSubject(scheduleId: string, id: string): Promise<ResultApp<void, AppErr>> {
    return this.inner.archiveSubject(scheduleId, id);
    // (no parcheamos la caché de subjects acá a propósito: no tenemos el
    // objeto completo sin una lectura extra, y la suscripción activa lo
    // corrige casi instantáneamente — ver nota de clase.)
  }

  async createClassSlot(
    scheduleId: string,
    data: CreateClassSlotDTO,
  ): Promise<ResultApp<ClassSlot, AppErr>> {
    const result = await this.inner.createClassSlot(scheduleId, data);
    if (isOk(result)) upsertCachedSlot(this.cacheKey, result.value);
    return result;
  }

  async applyClassSlotChangePlan(
    scheduleId: string,
    plan: ClassSlotChangePlan,
  ): Promise<ResultApp<{ createdVersionIds: string[] }, AppErr>> {
    const result = await this.inner.applyClassSlotChangePlan(scheduleId, plan);
    if (!isOk(result)) return result;

    if (plan.kind === "exception") {
      const [exceptionId] = result.value.createdVersionIds;
      upsertCachedException(this.cacheKey, {
        ...plan.exception,
        id: exceptionId,
        status: "active",
        supersedes: null,
        createdAt: Timestamp.now(),
      });
      return result;
    }

    // plan.kind === "versioning": reflejamos el cierre de la versión previa...
    const previous = getCachedSlotById(this.cacheKey, plan.closePrevious.versionId);
    if (previous) {
      upsertCachedSlot(this.cacheKey, {
        ...previous,
        status: "superseded",
        validToWeek: plan.closePrevious.validToWeek,
      });
    }

    // ...y las versiones nuevas, con los ids que devolvió la transacción.
    // El `createdAt` es una aproximación optimista (cliente, no servidor) —
    // se corrige solo en cuanto la suscripción activa reciba el snapshot real.
    const now = Timestamp.now();
    plan.newVersions.forEach((versionDto, index) => {
      const id = result.value.createdVersionIds[index];
      if (!id) return;
      upsertCachedSlot(this.cacheKey, {
        ...versionDto,
        id,
        status: "active",
        supersedes: plan.supersedes,
        createdAt: now,
      });
    });

    return result;
  }

  async upsertAttendance(
    scheduleId: string,
    data: UpsertAttendanceDTO,
  ): Promise<ResultApp<AttendanceRecord, AppErr>> {
    const result = await this.inner.upsertAttendance(scheduleId, data);
    if (isOk(result)) upsertCachedAttendance(this.cacheKey, result.value);
    return result;
  }
}

