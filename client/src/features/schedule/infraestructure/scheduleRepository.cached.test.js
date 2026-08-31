import { beforeEach, describe, expect, it } from "vitest";
import { Timestamp } from "firebase/firestore";
import { CachedScheduleRepository } from "./scheduleRepository.cached";
import { __resetAllScheduleCacheForTests } from "./scheduleCache";
import { createFakeScheduleRepository } from "./__fixtures__/fakeScheduleRepository";
import { FOREVER_WEEK } from "../domain/classSlot.entity";
import { isOk } from "#core/appCore/domain/AppCore.type";
const CACHE_KEY = "users/user-1/panels/panel-1/schedule";
const now = Timestamp.now();
function makeSchedule() {
    return {
        id: "sched-1",
        homePanelRef: { id: "panel-1" },
        name: "1er cuatrimestre",
        startDate: now,
        endDate: now,
        weekStartsOn: 1,
        holidays: [],
        createdAt: now,
        updatedAt: now,
    };
}
function makeSlot(overrides = {}) {
    return {
        id: "slot-1",
        slotGroupId: "grupo-1",
        scheduleId: "sched-1",
        subjectId: "subj-1",
        dayOfWeek: 2,
        startMinute: 9 * 60,
        endMinute: 11 * 60,
        type: "teoria",
        validFromWeek: 1,
        validToWeek: FOREVER_WEEK,
        status: "active",
        supersedes: null,
        createdAt: now,
        ...overrides,
    };
}
beforeEach(() => {
    __resetAllScheduleCacheForTests();
});
describe("CachedScheduleRepository — findSchedule", () => {
    it("primera llamada pega a la fuente; la segunda sale de caché", async () => {
        const { repository: inner, calls } = createFakeScheduleRepository({
            schedule: makeSchedule(),
        });
        const cached = new CachedScheduleRepository(inner, CACHE_KEY);
        await cached.findSchedule();
        await cached.findSchedule();
        expect(calls.findSchedule).toBe(1);
    });
    it("cachea también 'no existe todavía' — no reintenta en cada llamada", async () => {
        const { repository: inner, calls } = createFakeScheduleRepository();
        const cached = new CachedScheduleRepository(inner, CACHE_KEY);
        const first = await cached.findSchedule();
        const second = await cached.findSchedule();
        expect(isOk(first) && first.value).toBeUndefined();
        expect(isOk(second) && second.value).toBeUndefined();
        expect(calls.findSchedule).toBe(1);
    });
    it("dos cacheKey (paneles) distintos no comparten resultados", async () => {
        const { repository: inner, calls } = createFakeScheduleRepository({
            schedule: makeSchedule(),
        });
        const panelA = new CachedScheduleRepository(inner, "users/u/panels/a/schedule");
        const panelB = new CachedScheduleRepository(inner, "users/u/panels/b/schedule");
        await panelA.findSchedule();
        await panelB.findSchedule();
        expect(calls.findSchedule).toBe(2);
    });
    it("crear un Schedule puebla la caché sin necesidad de una suscripción activa", async () => {
        const { repository: inner, calls } = createFakeScheduleRepository();
        const cached = new CachedScheduleRepository(inner, CACHE_KEY);
        await cached.createSchedule({
            name: "Nuevo",
            homePanelRef: { id: "panel-1" },
            startDate: now,
            endDate: now,
            weekStartsOn: 1,
            holidays: [],
            createdAt: now,
            updatedAt: now,
        });
        await cached.findSchedule();
        expect(calls.findSchedule).toBe(0); // servido enteramente desde la caché que dejó `createSchedule`
    });
});
describe("CachedScheduleRepository — findActiveSlotVersion", () => {
    it("una vez que la suscripción trajo los slots, la query puntual no vuelve a la fuente", async () => {
        const slot = makeSlot();
        const { repository: inner, calls } = createFakeScheduleRepository({ slots: [slot] });
        const cached = new CachedScheduleRepository(inner, CACHE_KEY);
        // Simula que ScheduleContext ya se suscribió (como haría la capa de
        // presentación real al montar la página).
        cached.subscribeToSlotVersions("sched-1", () => { }, () => { });
        const result = await cached.findActiveSlotVersion("sched-1", "grupo-1", 5);
        expect(isOk(result) && result.value?.id).toBe("slot-1");
        expect(calls.findActiveSlotVersion).toBe(0); // resuelto desde caché, sin ir a la fuente
    });
    it("sin suscripción activa, cae de vuelta a la fuente (no rompe, solo no es gratis)", async () => {
        const slot = makeSlot();
        const { repository: inner, calls } = createFakeScheduleRepository({ slots: [slot] });
        const cached = new CachedScheduleRepository(inner, CACHE_KEY);
        const result = await cached.findActiveSlotVersion("sched-1", "grupo-1", 5);
        expect(isOk(result) && result.value?.id).toBe("slot-1");
        expect(calls.findActiveSlotVersion).toBe(1);
    });
});
describe("CachedScheduleRepository — applyClassSlotChangePlan mantiene la caché coherente", () => {
    it("después de cerrar+crear, una nueva consulta ve el estado ya actualizado sin ir a la fuente", async () => {
        const slot = makeSlot();
        const { repository: inner } = createFakeScheduleRepository({ slots: [slot] });
        const cached = new CachedScheduleRepository(inner, CACHE_KEY);
        // Precarga la caché (como haría la suscripción real).
        cached.subscribeToSlotVersions("sched-1", () => { }, () => { });
        await cached.applyClassSlotChangePlan("sched-1", {
            kind: "versioning",
            closePrevious: { versionId: "slot-1", validToWeek: 4 },
            supersedes: "slot-1",
            newVersions: [
                {
                    slotGroupId: "grupo-1",
                    scheduleId: "sched-1",
                    subjectId: "subj-1",
                    dayOfWeek: 2,
                    startMinute: 9 * 60,
                    endMinute: 11 * 60,
                    type: "teoria",
                    validFromWeek: 5,
                    validToWeek: FOREVER_WEEK,
                },
            ],
        });
        // La versión vieja sigue siendo la que "gobierna" las semanas que le
        // quedaron asignadas tras el cierre (1-4): sigue siendo encontrable,
        // solo que ahora con status "superseded" — el resolver la necesita así
        // para reconstruir el historial (§14). La semana 5 en adelante ya
        // resuelve contra la versión nueva.
        const oldResult = await cached.findActiveSlotVersion("sched-1", "grupo-1", 3);
        const newResult = await cached.findActiveSlotVersion("sched-1", "grupo-1", 5);
        expect(isOk(oldResult) && oldResult.value?.status).toBe("superseded");
        expect(isOk(oldResult) && oldResult.value?.validToWeek).toBe(4);
        expect(isOk(newResult) && newResult.value?.validFromWeek).toBe(5);
    });
});
