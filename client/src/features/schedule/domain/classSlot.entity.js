/**
 * `validToWeek` centinela para "para siempre". Ver diseño §5: usar un
 * entero grande en vez de `null` deja las queries de Firestore como una
 * simple comparación de rango (`validToWeek >= week`), sin tener que
 * resolver `null` con un `or()` aparte.
 */
export const FOREVER_WEEK = 9999;
/** Extrae solo los campos de contenido de un ClassSlot ya persistido (descarta identidad/vigencia/metadatos). */
export function toClassSlotContent(slot) {
    return {
        dayOfWeek: slot.dayOfWeek,
        startMinute: slot.startMinute,
        endMinute: slot.endMinute,
        type: slot.type,
        room: slot.room,
        building: slot.building,
        professor: slot.professor,
        notes: slot.notes,
    };
}
