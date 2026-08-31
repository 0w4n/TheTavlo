import { toClassSlotContent } from "./classSlot.entity";
import { buildAttendanceId } from "./attendanceRecord.entity";
import { isHoliday, timestampToLocalDateKey, toLocalDateKey, weekNumberAndDayToDate, } from "./weekMath";
import { Timestamp } from "firebase/firestore";
/**
 * Reconstruye el horario visible de una semana concreta — pasada, presente
 * o futura, con exactamente el mismo algoritmo en los tres casos — a partir
 * de la fuente de verdad versionada (diseño §14). Función pura: mismo input
 * siempre produce el mismo output, sin efectos secundarios ni llamadas a
 * Firestore.
 *
 * Prioridad de resolución (EC-9): una `OccurrenceException` activa para una
 * fecha exacta SIEMPRE gana sobre lo que diga el `ClassSlot` recurrente
 * vigente esa semana. Un festivo (EC-2) tiene prioridad sobre ambos: si el
 * día cae en un festivo del `Schedule`, no se produce ninguna instancia
 * para ese slot ese día, ni siquiera si hay una excepción que diría lo
 * contrario (no se contempla "excepción que reactiva un festivo").
 */
export function resolveWeek(input) {
    const { schedule, subjects, slots, exceptions, attendance, week } = input;
    const subjectsById = new Map(subjects.map((s) => [s.id, s]));
    const activeExceptionsByKey = indexActiveExceptionsByDateAndSlot(exceptions);
    const attendanceById = new Map(attendance.map((a) => [a.id, a]));
    const coveringSlots = latestCoveringSlotPerGroup(slots, week);
    const instances = [];
    for (const slot of coveringSlots) {
        const subject = subjectsById.get(slot.subjectId);
        if (!subject)
            continue; // asignatura archivada/borrada de forma inconsistente — no romper el render (EC-7)
        const date = weekNumberAndDayToDate(schedule, week, slot.dayOfWeek);
        if (isHoliday(schedule, date))
            continue; // el festivo gana siempre, EC-2
        const dateKey = toLocalDateKey(date);
        const exception = activeExceptionsByKey.get(`${slot.slotGroupId}__${dateKey}`);
        const instance = buildInstance({
            slot,
            subject,
            date,
            exception,
            attendanceById,
        });
        instances.push(instance);
    }
    return instances.sort((a, b) => a.dayOfWeek !== b.dayOfWeek
        ? a.dayOfWeek - b.dayOfWeek
        : a.startMinute - b.startMinute);
}
/**
 * De todas las versiones de un mismo `slotGroupId`, la que cubre `week`
 * (`validFromWeek <= week <= validToWeek`). Por construcción del algoritmo
 * de versionado (`classSlotVersioning.ts`) nunca debería haber más de una
 * por grupo cubriendo la misma semana; si los datos estuvieran corruptos y
 * hubiera más de una, nos quedamos con la más reciente (`createdAt`) para
 * no romper el render.
 */
function latestCoveringSlotPerGroup(slots, week) {
    const bestByGroup = new Map();
    for (const slot of slots) {
        if (slot.validFromWeek > week || slot.validToWeek < week)
            continue;
        const current = bestByGroup.get(slot.slotGroupId);
        if (!current || slot.createdAt.toMillis() > current.createdAt.toMillis()) {
            bestByGroup.set(slot.slotGroupId, slot);
        }
    }
    return Array.from(bestByGroup.values());
}
function indexActiveExceptionsByDateAndSlot(exceptions) {
    const byKey = new Map();
    for (const exception of exceptions) {
        if (exception.status !== "active")
            continue;
        const key = `${exception.slotGroupId}__${timestampToLocalDateKey(exception.date)}`;
        const current = byKey.get(key);
        if (!current || exception.createdAt.toMillis() > current.createdAt.toMillis()) {
            byKey.set(key, exception);
        }
    }
    return byKey;
}
function buildInstance(params) {
    const { slot, subject, date, exception, attendanceById } = params;
    const isCancelled = exception?.kind === "cancelled";
    const content = exception?.overrides
        ? { ...toClassSlotContent(slot), ...exception.overrides }
        : toClassSlotContent(slot);
    const attendanceId = buildAttendanceId(slot.slotGroupId, toLocalDateKey(date));
    return {
        slotGroupId: slot.slotGroupId,
        subjectId: subject.id,
        date: Timestamp.fromDate(date),
        dayOfWeek: content.dayOfWeek,
        startMinute: content.startMinute,
        endMinute: content.endMinute,
        type: content.type,
        room: content.room,
        building: content.building,
        professor: content.professor,
        notes: content.notes,
        color: subject.color,
        panelRef: subject.panelRef,
        sourceVersionId: exception ? exception.id : slot.id,
        isException: exception !== undefined,
        isCancelled,
        hasConflict: false, // se calcula en un segundo paso puro, ver `detectConflicts`
        attendance: isCancelled ? null : attendanceById.get(attendanceId) ?? null,
    };
}
/**
 * Segundo paso, deliberadamente separado de `resolveWeek` (diseño §16): a
 * partir de las instancias YA resueltas de una semana, marca `hasConflict`
 * en cualquier par que se solape en el mismo día (mismo `dayOfWeek`,
 * intervalos `[startMinute, endMinute)` que se cruzan). No bloquea nada,
 * solo anota — la decisión de qué hacer con el conflicto es de la UI.
 */
export function detectConflicts(instances) {
    const byDay = new Map();
    for (const instance of instances) {
        if (instance.isCancelled)
            continue; // una clase cancelada no puede "solaparse" con nada
        const list = byDay.get(instance.dayOfWeek) ?? [];
        list.push(instance);
        byDay.set(instance.dayOfWeek, list);
    }
    const conflictingKeys = new Set();
    for (const dayInstances of byDay.values()) {
        const sorted = [...dayInstances].sort((a, b) => a.startMinute - b.startMinute);
        for (let i = 0; i < sorted.length; i++) {
            for (let j = i + 1; j < sorted.length; j++) {
                if (sorted[j].startMinute >= sorted[i].endMinute)
                    break; // ya ordenado, no puede haber más solapes desde aquí
                conflictingKeys.add(sorted[i]);
                conflictingKeys.add(sorted[j]);
            }
        }
    }
    return instances.map((instance) => conflictingKeys.has(instance) ? { ...instance, hasConflict: true } : instance);
}
