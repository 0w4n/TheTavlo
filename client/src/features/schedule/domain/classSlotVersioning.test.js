import { describe, expect, it } from "vitest";
import { Timestamp } from "firebase/firestore";
import { planClassSlotDeletion, planClassSlotEdit } from "./classSlotVersioning";
import { FOREVER_WEEK } from "./classSlot.entity";
function tsNow() {
    return Timestamp.now();
}
const baseSlot = {
    id: "v1",
    slotGroupId: "grupo-mate-martes",
    scheduleId: "sched-1",
    subjectId: "subj-mate",
    dayOfWeek: 2,
    startMinute: 9 * 60,
    endMinute: 11 * 60,
    type: "teoria",
    room: "3B",
    validFromWeek: 1,
    validToWeek: FOREVER_WEEK,
    status: "active",
    supersedes: null,
    createdAt: tsNow(),
};
const someTuesday = new Date(2025, 8, 30); // martes cualquiera, solo para las excepciones puntuales
describe("planClassSlotEdit — scope today / thisWeek -> excepción puntual", () => {
    it("today: produce una excepción 'modified' sin tocar ningún ClassSlot", () => {
        const plan = planClassSlotEdit({
            activeSlot: baseSlot,
            scope: { kind: "today" },
            changes: { room: "Aula 5B" },
            occurrenceDate: someTuesday,
            currentWeek: 6,
        });
        expect(plan.kind).toBe("exception");
        if (plan.kind !== "exception")
            throw new Error("unreachable");
        expect(plan.exception.kind).toBe("modified");
        expect(plan.exception.overrides).toEqual({ room: "Aula 5B" });
        expect(plan.exception.slotGroupId).toBe(baseSlot.slotGroupId);
    });
    it("thisWeek: cambiar hora/día produce kind 'moved', no 'modified'", () => {
        const plan = planClassSlotEdit({
            activeSlot: baseSlot,
            scope: { kind: "thisWeek" },
            changes: { startMinute: 10 * 60, endMinute: 12 * 60 },
            occurrenceDate: someTuesday,
            currentWeek: 6,
        });
        expect(plan.kind).toBe("exception");
        if (plan.kind !== "exception")
            throw new Error("unreachable");
        expect(plan.exception.kind).toBe("moved");
    });
});
describe("planClassSlotEdit — scope fromNow / forever -> cierra + 1 versión nueva", () => {
    it("cierra la versión activa en currentWeek-1 y abre una nueva hasta FOREVER_WEEK", () => {
        const plan = planClassSlotEdit({
            activeSlot: baseSlot,
            scope: { kind: "fromNow" },
            changes: { professor: "Dra. Ruiz" },
            occurrenceDate: someTuesday,
            currentWeek: 6,
        });
        expect(plan.kind).toBe("versioning");
        if (plan.kind !== "versioning")
            throw new Error("unreachable");
        expect(plan.closePrevious).toEqual({ versionId: "v1", validToWeek: 5 });
        expect(plan.supersedes).toBe("v1");
        expect(plan.newVersions).toHaveLength(1);
        expect(plan.newVersions[0]).toMatchObject({
            professor: "Dra. Ruiz",
            room: "3B", // el resto del contenido se conserva
            validFromWeek: 6,
            validToWeek: FOREVER_WEEK,
            editReason: "fromNow",
        });
    });
    it("editar 'para siempre' justo en la semana en la que la versión actual empezó deja closePrevious con rango vacío (nunca aplicó, y es correcto)", () => {
        const justStarted = { ...baseSlot, validFromWeek: 6 };
        const plan = planClassSlotEdit({
            activeSlot: justStarted,
            scope: { kind: "forever" },
            changes: { room: "Aula nueva" },
            occurrenceDate: someTuesday,
            currentWeek: 6,
        });
        if (plan.kind !== "versioning")
            throw new Error("unreachable");
        expect(plan.closePrevious.validToWeek).toBe(5); // < validFromWeek original (6) => rango vacío, sin romper nada
    });
});
describe("planClassSlotEdit — scope weekRange (el caso central del diseño §14)", () => {
    it("ejemplo del diseño: Matemáticas 09-11 -> 10-12 en semanas 8-10, luego vuelve a 09-11", () => {
        const plan = planClassSlotEdit({
            activeSlot: baseSlot, // validFromWeek 1, validToWeek FOREVER_WEEK
            scope: { kind: "weekRange", fromWeek: 8, toWeek: 10 },
            changes: { startMinute: 10 * 60, endMinute: 12 * 60 },
            occurrenceDate: someTuesday,
            currentWeek: 8,
        });
        if (plan.kind !== "versioning")
            throw new Error("unreachable");
        expect(plan.closePrevious).toEqual({ versionId: "v1", validToWeek: 7 });
        expect(plan.newVersions).toHaveLength(2);
        const [rangeVersion, continuationVersion] = plan.newVersions;
        expect(rangeVersion).toMatchObject({
            startMinute: 10 * 60,
            endMinute: 12 * 60,
            validFromWeek: 8,
            validToWeek: 10,
        });
        expect(continuationVersion).toMatchObject({
            startMinute: 9 * 60, // contenido ORIGINAL, no el editado
            endMinute: 11 * 60,
            validFromWeek: 11,
            validToWeek: FOREVER_WEEK,
        });
    });
    it("si el rango consume el resto de la vigencia original, NO crea versión de continuación", () => {
        const boundedSlot = { ...baseSlot, validToWeek: 15 };
        const plan = planClassSlotEdit({
            activeSlot: boundedSlot,
            scope: { kind: "weekRange", fromWeek: 10, toWeek: 15 }, // llega justo hasta el final original
            changes: { room: "Aula temporal" },
            occurrenceDate: someTuesday,
            currentWeek: 10,
        });
        if (plan.kind !== "versioning")
            throw new Error("unreachable");
        expect(plan.newVersions).toHaveLength(1); // solo la versión del rango, sin continuación
    });
    it("EC-10: partir una versión que YA es fruto de un rango anterior sigue funcionando igual (opera sobre la versión activa, sea cual sea)", () => {
        // Simula que `baseSlot` ya es, en realidad, la "versión del rango" de una
        // edición anterior (semanas 8-10) — el algoritmo no necesita saberlo,
        // solo opera sobre la versión activa que se le pasa.
        const alreadyRangedSlot = {
            ...baseSlot,
            id: "v2-del-rango-anterior",
            validFromWeek: 8,
            validToWeek: 10,
        };
        const plan = planClassSlotEdit({
            activeSlot: alreadyRangedSlot,
            scope: { kind: "weekRange", fromWeek: 9, toWeek: 9 },
            changes: { room: "Aula excepcional solo semana 9" },
            occurrenceDate: someTuesday,
            currentWeek: 9,
        });
        if (plan.kind !== "versioning")
            throw new Error("unreachable");
        expect(plan.closePrevious).toEqual({
            versionId: "v2-del-rango-anterior",
            validToWeek: 8,
        });
        expect(plan.newVersions).toHaveLength(2);
        expect(plan.newVersions[0]).toMatchObject({ validFromWeek: 9, validToWeek: 9 });
        expect(plan.newVersions[1]).toMatchObject({ validFromWeek: 10, validToWeek: 10 }); // retoma el rango original (8-10) desde donde se cortó
    });
});
describe("planClassSlotDeletion", () => {
    it("today/thisWeek -> excepción 'cancelled', sin tocar ClassSlot", () => {
        const plan = planClassSlotDeletion({
            activeSlot: baseSlot,
            scope: { kind: "today" },
            occurrenceDate: someTuesday,
            currentWeek: 6,
        });
        expect(plan.kind).toBe("exception");
        if (plan.kind !== "exception")
            throw new Error("unreachable");
        expect(plan.exception.kind).toBe("cancelled");
    });
    it("fromNow/forever -> cierra la versión activa y NO crea sucesor (la clase deja de existir)", () => {
        const plan = planClassSlotDeletion({
            activeSlot: baseSlot,
            scope: { kind: "forever" },
            occurrenceDate: someTuesday,
            currentWeek: 6,
        });
        if (plan.kind !== "versioning")
            throw new Error("unreachable");
        expect(plan.closePrevious).toEqual({ versionId: "v1", validToWeek: 5 });
        expect(plan.newVersions).toHaveLength(0);
    });
    it("weekRange -> cierra y reabre el patrón ORIGINAL después del rango, sin versión intermedia (el hueco = sin clase esas semanas)", () => {
        const plan = planClassSlotDeletion({
            activeSlot: baseSlot,
            scope: { kind: "weekRange", fromWeek: 8, toWeek: 10 },
            occurrenceDate: someTuesday,
            currentWeek: 8,
        });
        if (plan.kind !== "versioning")
            throw new Error("unreachable");
        expect(plan.closePrevious).toEqual({ versionId: "v1", validToWeek: 7 });
        expect(plan.newVersions).toHaveLength(1); // solo la continuación — nada representa las semanas 8-10, y eso es correcto
        expect(plan.newVersions[0]).toMatchObject({
            startMinute: 9 * 60, // contenido original
            validFromWeek: 11,
            validToWeek: FOREVER_WEEK,
        });
    });
    it("weekRange que consume el resto de la vigencia -> tampoco crea continuación", () => {
        const boundedSlot = { ...baseSlot, validToWeek: 12 };
        const plan = planClassSlotDeletion({
            activeSlot: boundedSlot,
            scope: { kind: "weekRange", fromWeek: 10, toWeek: 12 },
            occurrenceDate: someTuesday,
            currentWeek: 10,
        });
        if (plan.kind !== "versioning")
            throw new Error("unreachable");
        expect(plan.newVersions).toHaveLength(0);
    });
});
