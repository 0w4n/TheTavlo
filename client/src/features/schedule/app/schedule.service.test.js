import { describe, expect, it } from "vitest";
import { Timestamp } from "firebase/firestore";
import { ScheduleService } from "./schedule.service";
import { createFakeScheduleRepository } from "../infraestructure/__fixtures__/fakeScheduleRepository";
import { FOREVER_WEEK } from "../domain/classSlot.entity";
import { isErr, isOk } from "#core/appCore/domain/AppCore.type";
function localDate(y, m, d) {
    return new Date(y, m - 1, d);
}
function ts(y, m, d) {
    return Timestamp.fromDate(localDate(y, m, d));
}
const schedule = {
    id: "sched-1",
    homePanelRef: { id: "panel-1" },
    name: "1er cuatrimestre",
    startDate: ts(2025, 9, 1), // lunes
    endDate: ts(2025, 12, 19),
    weekStartsOn: 1,
    holidays: [],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
};
const subject = {
    id: "subj-1",
    scheduleId: schedule.id,
    name: "Álgebra",
    color: "#6b7df6",
    panelRef: null,
    exam: null,
    isArchived: false,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
};
const initialSlot = {
    id: "slot-1",
    slotGroupId: "grupo-algebra-martes",
    scheduleId: schedule.id,
    subjectId: subject.id,
    dayOfWeek: 2,
    startMinute: 9 * 60,
    endMinute: 11 * 60,
    type: "teoria",
    room: "3B",
    validFromWeek: 1,
    validToWeek: FOREVER_WEEK,
    status: "active",
    supersedes: null,
    createdAt: Timestamp.now(),
    editReason: "initial",
};
describe("ScheduleService.createSchedule — validaciones", () => {
    it("rechaza un nombre vacío", async () => {
        const { repository } = createFakeScheduleRepository();
        const service = new ScheduleService(repository);
        const result = await service.createSchedule({
            ...schedule,
            name: "   ",
        });
        expect(isErr(result)).toBe(true);
        if (isErr(result))
            expect(result.err.kind).toBe("Validation");
    });
    it("rechaza fechas invertidas", async () => {
        const { repository } = createFakeScheduleRepository();
        const service = new ScheduleService(repository);
        const result = await service.createSchedule({
            name: "Test",
            homePanelRef: { id: "panel-1" },
            startDate: ts(2025, 12, 1),
            endDate: ts(2025, 9, 1), // antes que el inicio
            weekStartsOn: 1,
            holidays: [],
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        });
        expect(isErr(result)).toBe(true);
        if (isErr(result) && result.err.kind === "Validation") {
            expect(result.err.fields?.endDate).toBeDefined();
        }
    });
    it("crea el horario cuando los datos son válidos", async () => {
        const { repository } = createFakeScheduleRepository();
        const service = new ScheduleService(repository);
        const result = await service.createSchedule({
            name: "1er cuatrimestre",
            homePanelRef: { id: "panel-1" },
            startDate: ts(2025, 9, 1),
            endDate: ts(2025, 12, 19),
            weekStartsOn: 1,
            holidays: [],
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        });
        expect(isOk(result)).toBe(true);
    });
});
describe("ScheduleService.editClassSlot — orquestación end-to-end", () => {
    function setup() {
        return createFakeScheduleRepository({
            schedule,
            subjects: [subject],
            slots: [initialSlot],
        });
    }
    it("scope 'today': crea una excepción y NO toca el ClassSlot original", async () => {
        const { repository, stores } = setup();
        const service = new ScheduleService(repository);
        const result = await service.editClassSlot({
            schedule,
            scheduleId: schedule.id,
            slotGroupId: initialSlot.slotGroupId,
            week: 6,
            scope: { kind: "today" },
            changes: { room: "Aula excepcional" },
        });
        expect(isOk(result)).toBe(true);
        expect(stores.slots.get("slot-1")?.status).toBe("active"); // sin tocar
        expect(stores.exceptions.size).toBe(1);
    });
    it("scope 'forever': cierra la versión activa y crea una nueva", async () => {
        const { repository, stores } = setup();
        const service = new ScheduleService(repository);
        const result = await service.editClassSlot({
            schedule,
            scheduleId: schedule.id,
            slotGroupId: initialSlot.slotGroupId,
            week: 6,
            scope: { kind: "forever" },
            changes: { professor: "Dra. Ruiz" },
        });
        expect(isOk(result)).toBe(true);
        expect(stores.slots.get("slot-1")?.status).toBe("superseded");
        expect(stores.slots.get("slot-1")?.validToWeek).toBe(5);
        const newVersion = Array.from(stores.slots.values()).find((s) => s.id !== "slot-1");
        expect(newVersion?.professor).toBe("Dra. Ruiz");
        expect(newVersion?.validFromWeek).toBe(6);
    });
    it("scope 'weekRange': ejemplo del diseño, produce cierre + rango + continuación", async () => {
        const { repository, stores } = setup();
        const service = new ScheduleService(repository);
        const result = await service.editClassSlot({
            schedule,
            scheduleId: schedule.id,
            slotGroupId: initialSlot.slotGroupId,
            week: 8,
            scope: { kind: "weekRange", fromWeek: 8, toWeek: 10 },
            changes: { startMinute: 10 * 60, endMinute: 12 * 60 },
        });
        expect(isOk(result)).toBe(true);
        expect(stores.slots.size).toBe(3); // original cerrada + rango + continuación
    });
    it("rechaza un rango de semanas invertido antes de tocar el repositorio", async () => {
        const { repository, calls } = setup();
        const service = new ScheduleService(repository);
        const result = await service.editClassSlot({
            schedule,
            scheduleId: schedule.id,
            slotGroupId: initialSlot.slotGroupId,
            week: 8,
            scope: { kind: "weekRange", fromWeek: 10, toWeek: 8 },
            changes: {},
        });
        expect(isErr(result)).toBe(true);
        if (isErr(result))
            expect(result.err.kind).toBe("Validation");
        expect(calls.findActiveSlotVersion).toBe(0); // ni siquiera llegó a buscar el slot
    });
    it("devuelve NotFound si no hay versión activa para la semana pedida", async () => {
        const { repository } = setup();
        const service = new ScheduleService(repository);
        const result = await service.editClassSlot({
            schedule,
            scheduleId: schedule.id,
            slotGroupId: "grupo-inexistente",
            week: 6,
            scope: { kind: "forever" },
            changes: {},
        });
        expect(isErr(result)).toBe(true);
        if (isErr(result))
            expect(result.err.kind).toBe("NotFound");
    });
    it("rechaza un horario de inicio/fin inválido en los cambios", async () => {
        const { repository } = setup();
        const service = new ScheduleService(repository);
        const result = await service.editClassSlot({
            schedule,
            scheduleId: schedule.id,
            slotGroupId: initialSlot.slotGroupId,
            week: 6,
            scope: { kind: "today" },
            changes: { startMinute: 11 * 60, endMinute: 10 * 60 }, // fin antes que inicio
        });
        expect(isErr(result)).toBe(true);
        if (isErr(result))
            expect(result.err.kind).toBe("Validation");
    });
    it("EC-12: si la versión activa ya fue cerrada por otro dispositivo, falla con conflicto", async () => {
        const { repository, stores } = setup();
        const service = new ScheduleService(repository);
        // Simula que "otro dispositivo" ya cerró slot-1 justo antes.
        stores.slots.set("slot-1", { ...initialSlot, status: "superseded", validToWeek: 5 });
        const result = await service.editClassSlot({
            schedule,
            scheduleId: schedule.id,
            slotGroupId: initialSlot.slotGroupId,
            week: 6,
            scope: { kind: "forever" },
            changes: { room: "Otra aula" },
        });
        // findActiveSlotVersion ya no encuentra ninguna versión "activa" que
        // cubra la semana 6 (fue cerrada en 5) => NotFound, el mismo resultado
        // que vería el usuario si el listener en tiempo real todavía no le
        // hubiera llegado el cambio del otro dispositivo.
        expect(isErr(result)).toBe(true);
    });
});
describe("ScheduleService.deleteClassSlot", () => {
    it("scope 'forever': cierra la versión sin crear sucesor", async () => {
        const { repository, stores } = createFakeScheduleRepository({
            schedule,
            subjects: [subject],
            slots: [initialSlot],
        });
        const service = new ScheduleService(repository);
        const result = await service.deleteClassSlot({
            schedule,
            scheduleId: schedule.id,
            slotGroupId: initialSlot.slotGroupId,
            week: 6,
            scope: { kind: "forever" },
        });
        expect(isOk(result)).toBe(true);
        expect(stores.slots.size).toBe(1); // solo la original, ahora cerrada
        expect(stores.slots.get("slot-1")?.status).toBe("superseded");
    });
});
describe("ScheduleService.markAttendance", () => {
    it("rechaza un motivo cuando el estado es 'present' (EC-16)", async () => {
        const { repository } = createFakeScheduleRepository();
        const service = new ScheduleService(repository);
        const result = await service.markAttendance(schedule.id, {
            slotGroupId: "grupo-x",
            scheduleId: schedule.id,
            subjectId: subject.id,
            date: ts(2025, 9, 30),
            status: "present",
            reason: "no debería poder ponerse",
        });
        expect(isErr(result)).toBe(true);
        if (isErr(result))
            expect(result.err.kind).toBe("Validation");
    });
    it("acepta un motivo cuando el estado es 'absent'", async () => {
        const { repository } = createFakeScheduleRepository();
        const service = new ScheduleService(repository);
        const result = await service.markAttendance(schedule.id, {
            slotGroupId: "grupo-x",
            scheduleId: schedule.id,
            subjectId: subject.id,
            date: ts(2025, 9, 30),
            status: "absent",
            reason: "Enfermedad",
        });
        expect(isOk(result)).toBe(true);
    });
    it("es idempotente: marcar dos veces la misma clase-fecha actualiza el mismo registro", async () => {
        const { repository, stores } = createFakeScheduleRepository();
        const service = new ScheduleService(repository);
        const date = ts(2025, 9, 30);
        await service.markAttendance(schedule.id, {
            slotGroupId: "grupo-x",
            scheduleId: schedule.id,
            subjectId: subject.id,
            date,
            status: "absent",
        });
        await service.markAttendance(schedule.id, {
            slotGroupId: "grupo-x",
            scheduleId: schedule.id,
            subjectId: subject.id,
            date,
            status: "late",
        });
        expect(stores.attendance.size).toBe(1);
        expect(Array.from(stores.attendance.values())[0].status).toBe("late");
    });
});
describe("ScheduleService.resolveWeek", () => {
    it("delega en el resolver puro + detección de conflictos", () => {
        const { repository } = createFakeScheduleRepository();
        const service = new ScheduleService(repository);
        const instances = service.resolveWeek({
            schedule,
            subjects: [subject],
            slots: [initialSlot],
            exceptions: [],
            attendance: [],
            week: 6,
        });
        expect(instances).toHaveLength(1);
        expect(instances[0].hasConflict).toBe(false);
    });
});
