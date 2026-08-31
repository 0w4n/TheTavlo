import { vi } from "vitest";
import { Timestamp } from "firebase/firestore";
import { buildAttendanceId } from "../../domain/attendanceRecord.entity";
import { timestampToLocalDateKey } from "../../domain/weekMath";
import { err, firebaseErr, notFoundErr, ok, validationErr, } from "#core/appCore/domain/AppCore.type";
let autoId = 0;
function nextId(prefix) {
    autoId += 1;
    return `fake-${prefix}-${autoId}`;
}
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
export function createFakeScheduleRepository(seed) {
    let schedule = seed?.schedule ?? null;
    const subjects = new Map((seed?.subjects ?? []).map((s) => [s.id, s]));
    const slots = new Map((seed?.slots ?? []).map((s) => [s.id, s]));
    const exceptions = new Map((seed?.exceptions ?? []).map((e) => [e.id, e]));
    const attendance = new Map((seed?.attendance ?? []).map((a) => [a.id, a]));
    const calls = {
        findSchedule: 0,
        findActiveSlotVersion: 0,
        createSchedule: 0,
        createSubject: 0,
        createClassSlot: 0,
        applyClassSlotChangePlan: 0,
        upsertAttendance: 0,
    };
    const repository = {
        subscribeToSchedule(onData) {
            onData(schedule);
            return () => { };
        },
        subscribeToSubjects(_scheduleId, onData) {
            onData(Array.from(subjects.values()));
            return () => { };
        },
        subscribeToSlotVersions(_scheduleId, onData) {
            onData(Array.from(slots.values()));
            return () => { };
        },
        subscribeToExceptions(_scheduleId, onData) {
            onData(Array.from(exceptions.values()));
            return () => { };
        },
        subscribeToAttendance(_scheduleId, onData) {
            onData(Array.from(attendance.values()));
            return () => { };
        },
        async findSchedule() {
            calls.findSchedule += 1;
            return ok(schedule ?? undefined);
        },
        async findActiveSlotVersion(_scheduleId, slotGroupId, week) {
            calls.findActiveSlotVersion += 1;
            const found = Array.from(slots.values()).find((s) => s.slotGroupId === slotGroupId && s.validFromWeek <= week && week <= s.validToWeek);
            return ok(found);
        },
        async createSchedule(data) {
            calls.createSchedule += 1;
            if (schedule) {
                return err(validationErr("Este panel ya tiene un horario asociado"));
            }
            const id = nextId("schedule");
            schedule = { id, ...data };
            return ok(schedule);
        },
        async updateSchedule(id, data) {
            if (!schedule || schedule.id !== id) {
                return err(notFoundErr(`Schedule "${id}" no encontrado`));
            }
            schedule = { ...schedule, ...data };
            return ok(schedule);
        },
        async createSubject(scheduleId, data) {
            calls.createSubject += 1;
            const id = nextId("subject");
            const subject = { id, isArchived: false, ...data, scheduleId };
            subjects.set(id, subject);
            return ok(subject);
        },
        async updateSubject(_scheduleId, id, data) {
            const existing = subjects.get(id);
            if (!existing)
                return err(notFoundErr(`Subject "${id}" no encontrado`));
            const updated = { ...existing, ...data };
            subjects.set(id, updated);
            return ok(updated);
        },
        async archiveSubject(_scheduleId, id) {
            const existing = subjects.get(id);
            if (!existing)
                return err(notFoundErr(`Subject "${id}" no encontrado`));
            subjects.set(id, { ...existing, isArchived: true });
            return ok(undefined);
        },
        async createClassSlot(scheduleId, data) {
            calls.createClassSlot += 1;
            const id = nextId("slot");
            const slot = {
                id,
                status: "active",
                supersedes: null,
                createdAt: Timestamp.now(),
                editReason: "initial",
                ...data,
                scheduleId,
            };
            slots.set(id, slot);
            return ok(slot);
        },
        async applyClassSlotChangePlan(scheduleId, plan) {
            calls.applyClassSlotChangePlan += 1;
            if (plan.kind === "exception") {
                const id = nextId("exception");
                const exception = {
                    id,
                    status: "active",
                    supersedes: null,
                    createdAt: Timestamp.now(),
                    ...plan.exception,
                };
                exceptions.set(id, exception);
                return ok({ createdVersionIds: [id] });
            }
            // Simula la transacción real: relee la versión a cerrar y verifica
            // concurrencia optimista antes de aplicar nada (EC-12).
            const previous = slots.get(plan.closePrevious.versionId);
            if (!previous) {
                return err(firebaseErr("La versión de la clase que se intenta cerrar ya no existe"));
            }
            if (previous.status !== "active") {
                return err(firebaseErr("Esta clase fue modificada en otro dispositivo antes de guardar este cambio"));
            }
            slots.set(previous.id, {
                ...previous,
                status: "superseded",
                validToWeek: plan.closePrevious.validToWeek,
            });
            const createdIds = [];
            const now = Timestamp.now();
            for (const versionDto of plan.newVersions) {
                const id = nextId("slot");
                const newSlot = {
                    id,
                    status: "active",
                    supersedes: plan.supersedes,
                    createdAt: now,
                    ...versionDto,
                    scheduleId,
                };
                slots.set(id, newSlot);
                createdIds.push(id);
            }
            return ok({ createdVersionIds: createdIds });
        },
        async upsertAttendance(scheduleId, data) {
            calls.upsertAttendance += 1;
            const id = buildAttendanceId(data.slotGroupId, timestampToLocalDateKey(data.date));
            const existing = attendance.get(id);
            const now = Timestamp.now();
            const record = {
                id,
                ...data,
                scheduleId,
                createdAt: existing?.createdAt ?? now,
                updatedAt: now,
            };
            attendance.set(id, record);
            return ok(record);
        },
    };
    return {
        repository,
        calls,
        /** Acceso directo a los stores internos — útil para setup/aserciones en tests. */
        stores: { subjects, slots, exceptions, attendance },
        getSchedule: () => schedule,
        spies: {
            findSchedule: vi.spyOn(repository, "findSchedule"),
            findActiveSlotVersion: vi.spyOn(repository, "findActiveSlotVersion"),
        },
    };
}
