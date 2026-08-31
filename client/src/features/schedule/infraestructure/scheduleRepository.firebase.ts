import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  Timestamp,
  onSnapshot,
  runTransaction,
  type DocumentReference,
  type Firestore,
  type Unsubscribe,
} from "firebase/firestore";
import type { ScheduleRepository } from "../app/scheduleRepository.interface";
import type { CreateScheduleDTO, Schedule, UpdateScheduleDTO } from "../domain/schedule.entity";
import type { CreateSubjectDTO, Subject, UpdateSubjectDTO } from "../domain/subject.entity";
import type { ClassSlot, CreateClassSlotDTO } from "../domain/classSlot.entity";
import type { OccurrenceException } from "../domain/occurrenceException.entity";
import type { AttendanceRecord, UpsertAttendanceDTO } from "../domain/attendanceRecord.entity";
import { buildAttendanceId } from "../domain/attendanceRecord.entity";
import { timestampToLocalDateKey } from "../domain/weekMath";
import type { ClassSlotChangePlan } from "../domain/classSlotVersioning";
import type { GlobalContextValue } from "#core/globalContext/context/globalContext";
import { resolvePanelOwner } from "#core/globalContext/resolvePanelOwner";
import {
  err,
  ok,
  validationErr,
  firebaseErr,
  type AppErr,
  type ResultApp,
} from "#core/appCore/domain/AppCore.type";
import {
  attendanceRecordConverter,
  classSlotConverter,
  occurrenceExceptionConverter,
  scheduleConverter,
  subjectConverter,
} from "./schedule.converters";

/** Firestore rechaza `undefined` en cualquier campo (no está activado `ignoreUndefinedProperties`) — los campos opcionales del dominio (room, professor, notes, reason...) hay que limpiarlos antes de cada escritura. */
function stripUndefined<T extends Record<string, unknown>>(data: T): T {
  const result = { ...data };
  for (const key of Object.keys(result)) {
    if (result[key] === undefined) delete result[key];
  }
  return result;
}

export class FirebaseScheduleRepository implements ScheduleRepository {
  constructor(
    private firestore: Firestore,
    private getCurrentContext: () => GlobalContextValue,
  ) {}

  // ─── Rutas ───────────────────────────────────────────────────────────────

  private getContext(): GlobalContextValue {
    return this.getCurrentContext();
  }

  private getPanelPath(): string {
    const ctx = this.getContext();
    const { accountType, ownerId } = resolvePanelOwner(ctx);
    const { panelId } = ctx.state.panel;
    return `${accountType}/${ownerId}/panels/${panelId}`;
  }

  private getPanelRef(): DocumentReference {
    return doc(this.firestore, this.getPanelPath());
  }

  private getScheduleCollectionPath(): string {
    return `${this.getPanelPath()}/schedule`;
  }

  private getSubjectsPath(scheduleId: string): string {
    return `${this.getScheduleCollectionPath()}/${scheduleId}/subjects`;
  }

  private getSlotVersionsPath(scheduleId: string): string {
    return `${this.getScheduleCollectionPath()}/${scheduleId}/slotVersions`;
  }

  private getExceptionsPath(scheduleId: string): string {
    return `${this.getScheduleCollectionPath()}/${scheduleId}/exceptions`;
  }

  private getAttendancePath(scheduleId: string): string {
    return `${this.getScheduleCollectionPath()}/${scheduleId}/attendance`;
  }

  private scheduleCollectionRef() {
    return collection(this.firestore, this.getScheduleCollectionPath()).withConverter(
      scheduleConverter,
    );
  }

  private subjectsCollectionRef(scheduleId: string) {
    return collection(this.firestore, this.getSubjectsPath(scheduleId)).withConverter(
      subjectConverter,
    );
  }

  private slotVersionsCollectionRef(scheduleId: string) {
    return collection(this.firestore, this.getSlotVersionsPath(scheduleId)).withConverter(
      classSlotConverter,
    );
  }

  private exceptionsCollectionRef(scheduleId: string) {
    return collection(this.firestore, this.getExceptionsPath(scheduleId)).withConverter(
      occurrenceExceptionConverter,
    );
  }

  private attendanceCollectionRef(scheduleId: string) {
    return collection(this.firestore, this.getAttendancePath(scheduleId)).withConverter(
      attendanceRecordConverter,
    );
  }

  // ─── Suscripciones ────────────────────────────────────────────────────────

  subscribeToSchedule(
    onData: (schedule: Schedule | null) => void,
    onError: (err: AppErr) => void,
  ): Unsubscribe {
    return onSnapshot(
      query(this.scheduleCollectionRef()),
      (snap) => onData(snap.empty ? null : snap.docs[0].data()),
      (error) => onError(firebaseErr(error.message, error.code, error.stack)),
    );
  }

  subscribeToSubjects(
    scheduleId: string,
    onData: (subjects: Subject[]) => void,
    onError: (err: AppErr) => void,
  ): Unsubscribe {
    return onSnapshot(
      query(this.subjectsCollectionRef(scheduleId)),
      (snap) => onData(snap.docs.map((d) => d.data())),
      (error) => onError(firebaseErr(error.message, error.code, error.stack)),
    );
  }

  subscribeToSlotVersions(
    scheduleId: string,
    onData: (slots: ClassSlot[]) => void,
    onError: (err: AppErr) => void,
  ): Unsubscribe {
    // Se traen TODAS las versiones (activas y superseded) a propósito — el
    // historial completo ES la fuente de verdad del resolver, ver diseño §14.
    return onSnapshot(
      query(this.slotVersionsCollectionRef(scheduleId)),
      (snap) => onData(snap.docs.map((d) => d.data())),
      (error) => onError(firebaseErr(error.message, error.code, error.stack)),
    );
  }

  subscribeToExceptions(
    scheduleId: string,
    onData: (exceptions: OccurrenceException[]) => void,
    onError: (err: AppErr) => void,
  ): Unsubscribe {
    return onSnapshot(
      query(this.exceptionsCollectionRef(scheduleId)),
      (snap) => onData(snap.docs.map((d) => d.data())),
      (error) => onError(firebaseErr(error.message, error.code, error.stack)),
    );
  }

  subscribeToAttendance(
    scheduleId: string,
    onData: (records: AttendanceRecord[]) => void,
    onError: (err: AppErr) => void,
  ): Unsubscribe {
    return onSnapshot(
      query(this.attendanceCollectionRef(scheduleId)),
      (snap) => onData(snap.docs.map((d) => d.data())),
      (error) => onError(firebaseErr(error.message, error.code, error.stack)),
    );
  }

  // ─── Queries puntuales ────────────────────────────────────────────────────

  async findSchedule(): Promise<ResultApp<Schedule | undefined, AppErr>> {
    try {
      const snap = await getDocs(query(this.scheduleCollectionRef()));
      return ok(snap.empty ? undefined : snap.docs[0].data());
    } catch (error) {
      return err(toFirebaseErr(error, "Error al leer el horario del panel"));
    }
  }

  /**
   * Requiere un índice compuesto sobre `slotVersions`:
   * `slotGroupId ASC, validFromWeek ASC, validToWeek ASC` (ver diseño §10).
   */
  async findActiveSlotVersion(
    scheduleId: string,
    slotGroupId: string,
    week: number,
  ): Promise<ResultApp<ClassSlot | undefined, AppErr>> {
    try {
      const q = query(
        this.slotVersionsCollectionRef(scheduleId),
        where("slotGroupId", "==", slotGroupId),
        where("validFromWeek", "<=", week),
        where("validToWeek", ">=", week),
      );
      const snap = await getDocs(q);
      if (snap.empty) return ok(undefined);
      // Por invariante del algoritmo de versionado nunca debería haber más
      // de un resultado — si los datos estuvieran corruptos, nos quedamos
      // con el más reciente para no romper el flujo (igual criterio que el resolver).
      const latest = snap.docs.reduce((best, current) =>
        current.data().createdAt.toMillis() > best.data().createdAt.toMillis() ? current : best,
      );
      return ok(latest.data());
    } catch (error) {
      return err(toFirebaseErr(error, "Error al buscar la versión activa de la clase"));
    }
  }

  // ─── Schedule ────────────────────────────────────────────────────────────

  async createSchedule(data: CreateScheduleDTO): Promise<ResultApp<Schedule, AppErr>> {
    const existing = await this.findSchedule();
    if (existing.success && existing.value) {
      return err(
        validationErr("Este panel ya tiene un horario asociado", {
          panel: "Un panel solo puede tener un horario (relación 0..1)",
        }),
      );
    }

    try {
      const ref = doc(this.scheduleCollectionRef());
      const now = Timestamp.now();
      const docData = stripUndefined({
        ...data,
        homePanelRef: this.getPanelRef(),
        createdAt: data.createdAt ?? now,
        updatedAt: data.updatedAt ?? now,
      }) as Schedule;
      await setDoc(ref, docData);
      return ok({ ...docData, id: ref.id });
    } catch (error) {
      return err(toFirebaseErr(error, "Error al crear el horario"));
    }
  }

  async updateSchedule(
    id: string,
    data: UpdateScheduleDTO,
  ): Promise<ResultApp<Schedule, AppErr>> {
    try {
      const ref = doc(this.firestore, this.getScheduleCollectionPath(), id).withConverter(
        scheduleConverter,
      );
      const updateData = stripUndefined({ ...data, updatedAt: Timestamp.now() });
      await updateDoc(ref, updateData);

      const snap = await getDoc(ref);
      if (!snap.exists()) return err(firebaseErr("Error al leer el horario actualizado"));
      return ok(snap.data());
    } catch (error) {
      return err(toFirebaseErr(error, "Error al actualizar el horario"));
    }
  }

  // ─── Subject ─────────────────────────────────────────────────────────────

  async createSubject(
    scheduleId: string,
    data: CreateSubjectDTO,
  ): Promise<ResultApp<Subject, AppErr>> {
    try {
      const ref = doc(this.subjectsCollectionRef(scheduleId));
      const now = Timestamp.now();
      const docData = stripUndefined({
        ...data,
        createdAt: data.createdAt ?? now,
        updatedAt: data.updatedAt ?? now,
      }) as Subject;
      await setDoc(ref, docData);
      return ok({ ...docData, id: ref.id });
    } catch (error) {
      return err(toFirebaseErr(error, "Error al crear la asignatura"));
    }
  }

  async updateSubject(
    scheduleId: string,
    id: string,
    data: UpdateSubjectDTO,
  ): Promise<ResultApp<Subject, AppErr>> {
    try {
      const ref = doc(this.firestore, this.getSubjectsPath(scheduleId), id).withConverter(
        subjectConverter,
      );
      const updateData = stripUndefined({ ...data, updatedAt: Timestamp.now() });
      await updateDoc(ref, updateData);

      const snap = await getDoc(ref);
      if (!snap.exists()) return err(firebaseErr("Error al leer la asignatura actualizada"));
      return ok(snap.data());
    } catch (error) {
      return err(toFirebaseErr(error, "Error al actualizar la asignatura"));
    }
  }

  async archiveSubject(scheduleId: string, id: string): Promise<ResultApp<void, AppErr>> {
    try {
      const ref = doc(this.firestore, this.getSubjectsPath(scheduleId), id);
      await updateDoc(ref, { isArchived: true, updatedAt: Timestamp.now() });
      return ok(undefined);
    } catch (error) {
      return err(toFirebaseErr(error, "Error al archivar la asignatura"));
    }
  }

  // ─── ClassSlot ───────────────────────────────────────────────────────────

  async createClassSlot(
    scheduleId: string,
    data: CreateClassSlotDTO,
  ): Promise<ResultApp<ClassSlot, AppErr>> {
    try {
      const ref = doc(this.slotVersionsCollectionRef(scheduleId));
      const docData = stripUndefined({
        ...data,
        status: "active" as const,
        supersedes: null,
        createdAt: Timestamp.now(),
        editReason: data.editReason ?? "initial",
      }) as ClassSlot;
      await setDoc(ref, docData);
      return ok({ ...docData, id: ref.id });
    } catch (error) {
      return err(toFirebaseErr(error, "Error al crear la clase"));
    }
  }

  /**
   * Ejecuta el plan de versionado dentro de una `runTransaction`: relee la
   * versión a cerrar DENTRO de la transacción y verifica que su `status`
   * siga siendo "active" — si otro dispositivo ya la cerró entretanto
   * (EC-12), la transacción aborta y Firestore la reintenta automáticamente
   * contra el estado más reciente un número limitado de veces antes de
   * rendirse; si sigue en conflicto, propagamos el error tal cual para que
   * la capa de presentación ofrezca "ver cambios / reintentar" (Flujo C, §8).
   */
  async applyClassSlotChangePlan(
    scheduleId: string,
    plan: ClassSlotChangePlan,
  ): Promise<ResultApp<{ createdVersionIds: string[] }, AppErr>> {
    if (plan.kind === "exception") {
      try {
        const ref = doc(this.exceptionsCollectionRef(scheduleId));
        const docData = stripUndefined({
          ...plan.exception,
          status: "active" as const,
          supersedes: null,
          createdAt: Timestamp.now(),
        }) as OccurrenceException;
        await setDoc(ref, docData);
        return ok({ createdVersionIds: [ref.id] });
      } catch (error) {
        return err(toFirebaseErr(error, "Error al guardar la excepción"));
      }
    }

    try {
      const createdIds = await runTransaction(this.firestore, async (tx) => {
        const prevRef = doc(
          this.firestore,
          this.getSlotVersionsPath(scheduleId),
          plan.closePrevious.versionId,
        ).withConverter(classSlotConverter);
        const prevSnap = await tx.get(prevRef);

        if (!prevSnap.exists()) {
          throw new Error("La versión de la clase que se intenta cerrar ya no existe");
        }
        if (prevSnap.data().status !== "active") {
          throw new Error(
            "Esta clase fue modificada en otro dispositivo antes de guardar este cambio",
          );
        }

        tx.update(prevRef, {
          status: "superseded",
          validToWeek: plan.closePrevious.validToWeek,
        });

        const now = Timestamp.now();
        const newRefs = plan.newVersions.map(() => doc(this.slotVersionsCollectionRef(scheduleId)));

        plan.newVersions.forEach((versionDto, index) => {
          const docData = stripUndefined({
            ...versionDto,
            status: "active" as const,
            supersedes: plan.supersedes,
            createdAt: now,
          }) as ClassSlot;
          tx.set(newRefs[index], docData);
        });

        return newRefs.map((r) => r.id);
      });

      return ok({ createdVersionIds: createdIds });
    } catch (error) {
      return err(toFirebaseErr(error, "Error al guardar los cambios del horario"));
    }
  }

  // ─── Attendance ──────────────────────────────────────────────────────────

  async upsertAttendance(
    scheduleId: string,
    data: UpsertAttendanceDTO,
  ): Promise<ResultApp<AttendanceRecord, AppErr>> {
    try {
      const localDateKey = timestampToLocalDateKey(data.date);
      const id = buildAttendanceId(data.slotGroupId, localDateKey);
      const ref = doc(this.firestore, this.getAttendancePath(scheduleId), id).withConverter(
        attendanceRecordConverter,
      );

      const existingSnap = await getDoc(ref);
      const now = Timestamp.now();
      const docData = stripUndefined({
        ...data,
        createdAt: existingSnap.exists() ? existingSnap.data().createdAt : now,
        updatedAt: now,
      }) as AttendanceRecord;

      await setDoc(ref, docData);
      return ok({ ...docData, id });
    } catch (error) {
      return err(toFirebaseErr(error, "Error al guardar la asistencia"));
    }
  }
}

function toFirebaseErr(error: unknown, fallbackMessage: string) {
  if (error instanceof Error) {
    return firebaseErr(error.message || fallbackMessage, undefined, error.stack);
  }
  return firebaseErr(fallbackMessage);
}
