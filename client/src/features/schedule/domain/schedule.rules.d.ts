import type { ClassSlotContent } from "./classSlot.entity";
import type { EditScope } from "./editScope.type";
import type { UpsertAttendanceDTO } from "./attendanceRecord.entity";
export default class ScheduleRules {
    static validateName(name: string): string | null;
    static validateDateRange(startDate: Date, endDate: Date): string | null;
    static validateSubjectName(name: string): string | null;
    static validateExamWeight(weightPercentage: number): string | null;
    static validateClassSlotContent(content: Pick<ClassSlotContent, "startMinute" | "endMinute">): string | null;
    /** Precondición del algoritmo de versionado (diseño §15): el alcance elegido debe operar sobre la versión efectivamente activa esa semana. */
    static validateSlotCoversWeek(slot: {
        validFromWeek: number;
        validToWeek: number;
    }, week: number): string | null;
    static validateWeekRangeScope(scope: EditScope): string | null;
    /** EC-16: un motivo solo tiene sentido si la asistencia es "absent" o "late" — nunca en "present". */
    static validateAttendance(data: Pick<UpsertAttendanceDTO, "status" | "reason">): string | null;
}
