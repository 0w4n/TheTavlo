import { FOREVER_WEEK, toClassSlotContent } from "./classSlot.entity";
import { isSingleOccurrenceScope } from "./editScope.type";
import { Timestamp } from "firebase/firestore";
/**
 * Decide qué escribir al editar una clase, según el alcance elegido por el
 * usuario en `EditScopeDialog` (diseño §7.3/§15).
 */
export function planClassSlotEdit(params) {
    const { activeSlot, scope, changes, occurrenceDate, currentWeek } = params;
    if (isSingleOccurrenceScope(scope)) {
        return {
            kind: "exception",
            exception: buildExceptionDTO(activeSlot, occurrenceDate, changes),
        };
    }
    if (scope.kind === "fromNow" || scope.kind === "forever") {
        const newContent = { ...toClassSlotContent(activeSlot), ...changes };
        return {
            kind: "versioning",
            closePrevious: { versionId: activeSlot.id, validToWeek: currentWeek - 1 },
            supersedes: activeSlot.id,
            newVersions: [
                buildClassSlotDTO(activeSlot, newContent, {
                    validFromWeek: currentWeek,
                    validToWeek: FOREVER_WEEK,
                    editReason: scope.kind,
                }),
            ],
        };
    }
    // scope.kind === "weekRange"
    const { fromWeek, toWeek } = scope;
    const newContent = { ...toClassSlotContent(activeSlot), ...changes };
    const originalContent = toClassSlotContent(activeSlot);
    const newVersions = [
        buildClassSlotDTO(activeSlot, newContent, {
            validFromWeek: fromWeek,
            validToWeek: toWeek,
            editReason: "weekRange",
        }),
    ];
    // Solo hace falta "reabrir" el patrón original si queda algo de vigencia
    // original DESPUÉS del rango editado (EC-10) — si el rango consume el
    // resto de la vigencia de `activeSlot`, no hay nada que continuar.
    if (toWeek < activeSlot.validToWeek) {
        newVersions.push(buildClassSlotDTO(activeSlot, originalContent, {
            validFromWeek: toWeek + 1,
            validToWeek: activeSlot.validToWeek,
            editReason: "weekRange",
        }));
    }
    return {
        kind: "versioning",
        closePrevious: { versionId: activeSlot.id, validToWeek: fromWeek - 1 },
        supersedes: activeSlot.id,
        newVersions,
    };
}
/**
 * Decide qué escribir al ELIMINAR una clase, según el alcance elegido.
 * Comparte estructura con `planClassSlotEdit` pero nunca reescribe
 * contenido — solo cierra vigencia y, si aplica, reabre el patrón original
 * después del rango borrado.
 */
export function planClassSlotDeletion(params) {
    const { activeSlot, scope, occurrenceDate, currentWeek } = params;
    if (isSingleOccurrenceScope(scope)) {
        return {
            kind: "exception",
            exception: {
                slotGroupId: activeSlot.slotGroupId,
                scheduleId: activeSlot.scheduleId,
                date: Timestamp.fromDate(occurrenceDate),
                kind: "cancelled",
            },
        };
    }
    if (scope.kind === "fromNow" || scope.kind === "forever") {
        return {
            kind: "versioning",
            closePrevious: { versionId: activeSlot.id, validToWeek: currentWeek - 1 },
            supersedes: activeSlot.id,
            newVersions: [], // no hay sucesor: la clase deja de existir a partir de aquí
        };
    }
    // scope.kind === "weekRange": "no hay clase durante estas semanas", pero
    // el patrón original vuelve después — no hace falta un "hueco" explícito,
    // la ausencia de versión activa esas semanas ya significa "no hay clase"
    // para el resolver (§14).
    const { fromWeek, toWeek } = scope;
    const originalContent = toClassSlotContent(activeSlot);
    const newVersions = [];
    if (toWeek < activeSlot.validToWeek) {
        newVersions.push(buildClassSlotDTO(activeSlot, originalContent, {
            validFromWeek: toWeek + 1,
            validToWeek: activeSlot.validToWeek,
            editReason: "weekRange",
        }));
    }
    return {
        kind: "versioning",
        closePrevious: { versionId: activeSlot.id, validToWeek: fromWeek - 1 },
        supersedes: activeSlot.id,
        newVersions,
    };
}
function buildExceptionDTO(activeSlot, occurrenceDate, changes) {
    const touchesTimeOrDay = changes.dayOfWeek !== undefined ||
        changes.startMinute !== undefined ||
        changes.endMinute !== undefined;
    return {
        slotGroupId: activeSlot.slotGroupId,
        scheduleId: activeSlot.scheduleId,
        date: Timestamp.fromDate(occurrenceDate),
        kind: touchesTimeOrDay ? "moved" : "modified",
        overrides: changes,
    };
}
function buildClassSlotDTO(activeSlot, content, vigencia) {
    return {
        slotGroupId: activeSlot.slotGroupId,
        scheduleId: activeSlot.scheduleId,
        subjectId: activeSlot.subjectId,
        ...content,
        ...vigencia,
    };
}
