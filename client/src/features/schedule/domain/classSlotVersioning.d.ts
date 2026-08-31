import type { ClassSlot, ClassSlotContent, CreateClassSlotDTO } from "./classSlot.entity";
import type { CreateOccurrenceExceptionDTO } from "./occurrenceException.entity";
import type { EditScope } from "./editScope.type";
/**
 * El "plan" que produce este módulo es puro dato — describe QUÉ hay que
 * escribir, nunca ejecuta la escritura. Quien invoque esto (el servicio de
 * aplicación) es quien decide cómo aplicarlo (una transacción de Firestore,
 * un fake en memoria en tests, etc. — ver diseño §16, control de
 * concurrencia optimista).
 *
 * Todas las versiones nuevas de un mismo plan comparten `supersedes` (el id
 * de la versión que se cierra): son splits de UN mismo evento de edición,
 * no una cadena estrictamente lineal — la trazabilidad de "quién reemplazó
 * a quién" vive en `closePrevious`, no en cada DTO individual.
 */
export type ClassSlotChangePlan = {
    kind: "exception";
    exception: CreateOccurrenceExceptionDTO;
} | {
    kind: "versioning";
    closePrevious: {
        versionId: string;
        validToWeek: number;
    };
    supersedes: string;
    newVersions: CreateClassSlotDTO[];
};
export interface PlanClassSlotEditParams {
    activeSlot: ClassSlot;
    scope: EditScope;
    changes: Partial<ClassSlotContent>;
    /** Fecha exacta de la ocurrencia editada — solo se usa para scope "today"/"thisWeek". */
    occurrenceDate: Date;
    /**
     * Semana actual del `Schedule` — solo se usa para scope "fromNow"/"forever"/"weekRange".
     * PRECONDICIÓN: `activeSlot.validFromWeek <= currentWeek <= activeSlot.validToWeek`
     * (quien llama debe haber resuelto ya cuál es "la versión activa para esta semana"
     * antes de invocar esto — el resolver de §14 es la fuente de esa resolución).
     */
    currentWeek: number;
}
/**
 * Decide qué escribir al editar una clase, según el alcance elegido por el
 * usuario en `EditScopeDialog` (diseño §7.3/§15).
 */
export declare function planClassSlotEdit(params: PlanClassSlotEditParams): ClassSlotChangePlan;
export interface PlanClassSlotDeletionParams {
    activeSlot: ClassSlot;
    scope: EditScope;
    occurrenceDate: Date;
    currentWeek: number;
}
/**
 * Decide qué escribir al ELIMINAR una clase, según el alcance elegido.
 * Comparte estructura con `planClassSlotEdit` pero nunca reescribe
 * contenido — solo cierra vigencia y, si aplica, reabre el patrón original
 * después del rango borrado.
 */
export declare function planClassSlotDeletion(params: PlanClassSlotDeletionParams): ClassSlotChangePlan;
