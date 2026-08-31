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
  date: Timestamp; // fecha real de esta ocurrencia
  dayOfWeek: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  startMinute: number;
  endMinute: number;
  type: ClassType;
  room?: string;
  building?: string;
  professor?: string;
  notes?: string;
  color: string; // heredado del Subject
  panelRef: DocumentReference | null; // Panel-vinculado del Subject, si tiene (diseño §0)
  sourceVersionId: string; // trazabilidad: qué ClassSlot/Exception la generó
  isException: boolean;
  isCancelled: boolean;
  hasConflict: boolean; // se calcula en un segundo paso, ver §16 — false por defecto en el resolver puro
  attendance: AttendanceRecord | null;
}
