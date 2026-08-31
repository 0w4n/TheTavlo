import type { Timestamp } from "firebase/firestore";
import type { ClassSlotContent, SlotStatus } from "./classSlot.entity";
export type ExceptionKind = "cancelled" | "modified" | "moved";
/**
 * Documento en `.../schedule/{scheduleId}/exceptions/{exceptionId}`.
 *
 * Un override para UNA fecha concreta: no versiona un patrón recurrente
 * (eso lo hace `ClassSlot`), versiona UN DÍA. Igual que `ClassSlot`, es
 * append-only — nunca se sobrescribe el contenido de una excepción ya
 * creada, solo se cierra su vigencia (`status`) si otra la reemplaza.
 *
 * Prioridad de resolución (diseño §14, EC-9): una excepción activa para
 * una fecha SIEMPRE gana sobre lo que diga el `ClassSlot` recurrente vigente
 * esa semana, sin importar en qué orden se crearon.
 */
export interface OccurrenceException {
    id: string;
    slotGroupId: string;
    scheduleId: string;
    date: Timestamp;
    kind: ExceptionKind;
    /** Solo relevante si kind !== "cancelled": campos que sobreescriben la resolución ese día. */
    overrides?: Partial<ClassSlotContent>;
    status: SlotStatus;
    supersedes: string | null;
    reason?: string;
    createdAt: Timestamp;
}
export type CreateOccurrenceExceptionDTO = Omit<OccurrenceException, "id" | "status" | "supersedes" | "createdAt">;
