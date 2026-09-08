import { Timestamp, type DocumentReference, type Unsubscribe } from "firebase/firestore";
import { trpcMutation, trpcQuery } from "#core/appCore/infraestructure/api/trpcClient";
import type { GlobalContextValue } from "#core/globalContext/context/globalContex.type";
import { resolvePanelOwner } from "#core/globalContext/resolvePanelOwner";
import { err, firebaseErr, ok, type AppErr, type ResultApp } from "#core/appCore/domain/AppCore.type";
import type { ScheduleRepository } from "../app/scheduleRepository.interface";
import type { CreateScheduleDTO, Schedule, UpdateScheduleDTO } from "../domain/schedule.entity";
import type { CreateSubjectDTO, Subject, UpdateSubjectDTO } from "../domain/subject.entity";
import type { ClassSlot, CreateClassSlotDTO } from "../domain/classSlot.entity";
import type { OccurrenceException } from "../domain/occurrenceException.entity";
import type { AttendanceRecord, UpsertAttendanceDTO } from "../domain/attendanceRecord.entity";
import type { ClassSlotChangePlan } from "../domain/classSlotVersioning";

interface ScheduleSnapshot {
  schedule: unknown | null;
  subjects: unknown[];
  slots: unknown[];
  exceptions: unknown[];
  attendance: unknown[];
}

interface ScheduleSubscription<T> {
  select: (snapshot: ScheduleSnapshot | null) => T;
  onData: (value: T) => void;
  onError: (error: AppErr) => void;
}

const DATE_KEYS = new Set(["createdAt", "updatedAt", "startDate", "endDate", "startTime", "endTime", "date", "validFrom", "validTo"]);
const POLL_INTERVAL_MS = 30_000;

function scope(ctx: GlobalContextValue) {
  if (ctx.state.status !== "ready") throw new Error("GlobalContext aún no está listo");
  const owner = resolvePanelOwner(ctx);
  return { ownerId: owner.ownerId, ownerAccountType: owner.accountType, panelId: ctx.state.state.panel.panelId };
}

function reference(path: string): DocumentReference {
  return { id: path.split("/").pop() ?? path, path } as DocumentReference;
}

function hydrate(value: unknown, key?: string): unknown {
  if (typeof value === "string" && DATE_KEYS.has(key ?? "")) return Timestamp.fromDate(new Date(value));
  if (typeof value === "string" && (key?.endsWith("Ref") || key === "supersedes")) return reference(value);
  if (Array.isArray(value)) return value.map((item) => hydrate(item));
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([name, nested]) => [name, hydrate(nested, name)]));
  return value;
}

function encode(value: unknown): unknown {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (value && typeof value === "object" && "path" in value && typeof value.path === "string") return value.path;
  if (Array.isArray(value)) return value.map(encode);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, encode(nested)]));
  return value;
}

function appError(error: unknown): AppErr {
  return firebaseErr(error instanceof Error ? error.message : "Error al consultar el horario");
}

export class TrpcScheduleRepository implements ScheduleRepository {
  constructor(private getContext: () => GlobalContextValue) {}

  private readonly subscriptions = new Set<ScheduleSubscription<unknown>>();
  private cachedSnapshot: ScheduleSnapshot | null | undefined;
  private pollingTimer: number | undefined;
  private refreshInFlight: Promise<void> | undefined;

  private async snapshot(): Promise<ScheduleSnapshot | null> {
    return trpcQuery<ScheduleSnapshot | null>("schedule.snapshot", scope(this.getContext()));
  }

  private subscribe<T>(select: (snapshot: ScheduleSnapshot | null) => T, onData: (value: T) => void, onError: (error: AppErr) => void): Unsubscribe {
    const subscription: ScheduleSubscription<T> = { select, onData, onError };
    this.subscriptions.add(subscription as ScheduleSubscription<unknown>);

    if (this.cachedSnapshot !== undefined) onData(select(this.cachedSnapshot));
    if (this.subscriptions.size === 1) {
      void this.refreshSubscriptions();
      this.pollingTimer = window.setInterval(() => void this.refreshSubscriptions(), POLL_INTERVAL_MS);
    }

    return () => {
      this.subscriptions.delete(subscription as ScheduleSubscription<unknown>);
      if (this.subscriptions.size === 0 && this.pollingTimer !== undefined) {
        window.clearInterval(this.pollingTimer);
        this.pollingTimer = undefined;
      }
    };
  }

  private async refreshSubscriptions(): Promise<void> {
    if (this.refreshInFlight) return this.refreshInFlight;
    this.refreshInFlight = this.loadAndNotify();
    try {
      await this.refreshInFlight;
    } finally {
      this.refreshInFlight = undefined;
    }
  }

  private async loadAndNotify(): Promise<void> {
    try {
      this.cachedSnapshot = await this.snapshot();
      for (const subscription of this.subscriptions) {
        subscription.onData(subscription.select(this.cachedSnapshot));
      }
    } catch (error) {
      const normalizedError = appError(error);
      for (const subscription of this.subscriptions) subscription.onError(normalizedError);
    }
  }

  subscribeToSchedule(onData: (schedule: Schedule | null) => void, onError: (error: AppErr) => void): Unsubscribe {
    return this.subscribe((snapshot) => snapshot?.schedule ? hydrate(snapshot.schedule) as Schedule : null, onData, onError);
  }
  subscribeToSubjects(scheduleId: string, onData: (subjects: Subject[]) => void, onError: (error: AppErr) => void): Unsubscribe {
    return this.subscribe((snapshot) => snapshot?.subjects.filter((subject: any) => subject.scheduleId === scheduleId).map((subject) => hydrate(subject) as Subject) ?? [], onData, onError);
  }
  subscribeToSlotVersions(_scheduleId: string, onData: (slots: ClassSlot[]) => void, onError: (error: AppErr) => void): Unsubscribe {
    return this.subscribe((snapshot) => snapshot?.slots.map((slot) => hydrate(slot) as ClassSlot) ?? [], onData, onError);
  }
  subscribeToExceptions(_scheduleId: string, onData: (exceptions: OccurrenceException[]) => void, onError: (error: AppErr) => void): Unsubscribe {
    return this.subscribe((snapshot) => snapshot?.exceptions.map((item) => hydrate(item) as OccurrenceException) ?? [], onData, onError);
  }
  subscribeToAttendance(_scheduleId: string, onData: (records: AttendanceRecord[]) => void, onError: (error: AppErr) => void): Unsubscribe {
    return this.subscribe((snapshot) => snapshot?.attendance.map((item) => hydrate(item) as AttendanceRecord) ?? [], onData, onError);
  }

  async findSchedule(): Promise<ResultApp<Schedule | undefined, AppErr>> {
    try { const snapshot = await this.snapshot(); return ok(snapshot?.schedule ? hydrate(snapshot.schedule) as Schedule : undefined); }
    catch (error) { return err(appError(error)); }
  }

  async findActiveSlotVersion(_scheduleId: string, slotGroupId: string, week: number): Promise<ResultApp<ClassSlot | undefined, AppErr>> {
    try {
      const snapshot = await this.snapshot();
      const slot = snapshot?.slots.map((item) => hydrate(item) as ClassSlot).find((item) => item.slotGroupId === slotGroupId && item.validFromWeek <= week && item.validToWeek >= week);
      return ok(slot);
    } catch (error) { return err(appError(error)); }
  }

  async createSchedule(data: CreateScheduleDTO): Promise<ResultApp<Schedule, AppErr>> { return this.mutate("schedule.create", { ...scope(this.getContext()), data: encode(data) }); }
  async updateSchedule(id: string, data: UpdateScheduleDTO): Promise<ResultApp<Schedule, AppErr>> { return this.mutate("schedule.update", { ...scope(this.getContext()), scheduleId: id, data: encode(data) }); }
  async createSubject(scheduleId: string, data: CreateSubjectDTO): Promise<ResultApp<Subject, AppErr>> { return this.mutate("schedule.createSubject", { ...scope(this.getContext()), scheduleId, data: encode(data) }); }
  async updateSubject(scheduleId: string, id: string, data: UpdateSubjectDTO): Promise<ResultApp<Subject, AppErr>> { return this.mutate("schedule.updateSubject", { ...scope(this.getContext()), scheduleId, id, data: encode(data) }); }
  async archiveSubject(scheduleId: string, id: string): Promise<ResultApp<void, AppErr>> { return this.mutateVoid("schedule.archiveSubject", { ...scope(this.getContext()), scheduleId, id }); }
  async createClassSlot(scheduleId: string, data: CreateClassSlotDTO): Promise<ResultApp<ClassSlot, AppErr>> { return this.mutate("schedule.createClassSlot", { ...scope(this.getContext()), scheduleId, data: encode(data) }); }
  async applyClassSlotChangePlan(scheduleId: string, plan: ClassSlotChangePlan): Promise<ResultApp<{ createdVersionIds: string[] }, AppErr>> { return this.mutate("schedule.applyClassSlotChangePlan", { ...scope(this.getContext()), scheduleId, data: encode(plan) }); }
  async upsertAttendance(scheduleId: string, data: UpsertAttendanceDTO): Promise<ResultApp<AttendanceRecord, AppErr>> { return this.mutate("schedule.upsertAttendance", { ...scope(this.getContext()), scheduleId, data: encode(data) }); }

  private async mutate<T>(path: string, input: unknown): Promise<ResultApp<T, AppErr>> {
    try { return ok(hydrate(await trpcMutation<unknown>(path, input)) as T); }
    catch (error) { return err(appError(error)); }
  }
  private async mutateVoid(path: string, input: unknown): Promise<ResultApp<void, AppErr>> {
    try { await trpcMutation(path, input); return ok(undefined); }
    catch (error) { return err(appError(error)); }
  }
}
