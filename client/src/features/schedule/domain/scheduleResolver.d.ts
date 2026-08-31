import type { Schedule } from "./schedule.entity";
import type { Subject } from "./subject.entity";
import type { ClassSlot } from "./classSlot.entity";
import type { OccurrenceException } from "./occurrenceException.entity";
import type { AttendanceRecord } from "./attendanceRecord.entity";
import type { ResolvedClassInstance } from "./resolvedInstance.entity";
export interface ResolveWeekInput {
    schedule: Pick<Schedule, "startDate" | "weekStartsOn" | "holidays">;
    subjects: Subject[];
    /** TODAS las versiones (activas Y superseded) — el resolver decide cuál aplica por rango, no por status (ver diseño §14). */
    slots: ClassSlot[];
    exceptions: OccurrenceException[];
    attendance: AttendanceRecord[];
    week: number;
}
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
export declare function resolveWeek(input: ResolveWeekInput): ResolvedClassInstance[];
/**
 * Segundo paso, deliberadamente separado de `resolveWeek` (diseño §16): a
 * partir de las instancias YA resueltas de una semana, marca `hasConflict`
 * en cualquier par que se solape en el mismo día (mismo `dayOfWeek`,
 * intervalos `[startMinute, endMinute)` que se cruzan). No bloquea nada,
 * solo anota — la decisión de qué hacer con el conflicto es de la UI.
 */
export declare function detectConflicts(instances: ResolvedClassInstance[]): ResolvedClassInstance[];
