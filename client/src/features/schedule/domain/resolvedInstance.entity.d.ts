import type { DocumentReference, Timestamp } from "firebase/firestore";
import type { ClassType } from "./classSlot.entity";
import type { AttendanceRecord } from "./attendanceRecord.entity";
/**
 * Salida PURA de `scheduleResolver` — nunca se persiste en Firestore, se
 * recalcula en cliente a partir de `ClassSlot[]` + `OccurrenceException[]`
 * + `AttendanceRecord[]` para una semana concreta (diseño §14).
 */
export interface ResolvedClassInstance {
    slotGroupId: string;
    subjectId: string;
    date: Timestamp;
    dayOfWeek: 1 | 2 | 3 | 4 | 5 | 6 | 7;
    startMinute: number;
    endMinute: number;
    type: ClassType;
    room?: string;
    building?: string;
    professor?: string;
    notes?: string;
    color: string;
    panelRef: DocumentReference | null;
    sourceVersionId: string;
    isException: boolean;
    isCancelled: boolean;
    hasConflict: boolean;
    attendance: AttendanceRecord | null;
}
