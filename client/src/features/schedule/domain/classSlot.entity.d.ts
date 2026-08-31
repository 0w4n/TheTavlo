import type { Timestamp } from "firebase/firestore";
export type ClassType = "teoria" | "laboratorio" | "seminario" | "examen" | "tutoria" | "otro";
export type SlotStatus = "active" | "superseded";
/**
 * `validToWeek` centinela para "para siempre". Ver diseño §5: usar un
 * entero grande en vez de `null` deja las queries de Firestore como una
 * simple comparación de rango (`validToWeek >= week`), sin tener que
 * resolver `null` con un `or()` aparte.
 */
export declare const FOREVER_WEEK = 9999;
/**
 * Los campos de contenido de un ClassSlot que SÍ puede tocar una edición
 * (excluye identidad, vigencia y metadatos de versionado, que gestiona el
 * algoritmo de versionado, no el usuario directamente).
 */
export interface ClassSlotContent {
    dayOfWeek: 1 | 2 | 3 | 4 | 5 | 6 | 7;
    startMinute: number;
    endMinute: number;
    type: ClassType;
    room?: string;
    building?: string;
    professor?: string;
    notes?: string;
}
/**
 * Documento en `.../schedule/{scheduleId}/slotVersions/{versionId}`.
 *
 * Cada documento es una VERSIÓN INMUTABLE de un patrón recurrente. Nunca se
 * hace `update()` de contenido sobre un documento ya creado — la única
 * mutación permitida es el "cierre" de vigencia (`status` y `validToWeek`),
 * y siempre como parte de la misma transacción que crea el/los sucesor/es
 * (ver diseño §14, algoritmo de versionado en `classSlotVersioning.ts`).
 */
export interface ClassSlot extends ClassSlotContent {
    id: string;
    slotGroupId: string;
    scheduleId: string;
    subjectId: string;
    validFromWeek: number;
    validToWeek: number;
    status: SlotStatus;
    supersedes: string | null;
    createdAt: Timestamp;
    editReason?: "today" | "thisWeek" | "fromNow" | "weekRange" | "forever" | "initial";
}
export type CreateClassSlotDTO = Omit<ClassSlot, "id" | "status" | "supersedes" | "createdAt">;
/** Extrae solo los campos de contenido de un ClassSlot ya persistido (descarta identidad/vigencia/metadatos). */
export declare function toClassSlotContent(slot: ClassSlot): ClassSlotContent;
