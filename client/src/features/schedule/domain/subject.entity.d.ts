import type { DocumentReference, Timestamp } from "firebase/firestore";
export type ExamType = "parcial" | "final" | "recuperacion" | "practico" | "otro";
export interface SubjectExamInfo {
    hasExam: true;
    date: Timestamp;
    type: ExamType;
    weightPercentage: number;
    notes?: string;
}
export interface SubjectNoExamInfo {
    hasExam: false;
}
/**
 * Documento en `.../schedule/{scheduleId}/subjects/{subjectId}`.
 *
 * `panelRef` es el "Panel-vinculado" opcional (diseño §0, relación 2):
 * distinto del `homePanelRef` del `Schedule` que la contiene — puede
 * apuntar a cualquier otro Panel del usuario (ej. Álgebra → Panel Álgebra),
 * o quedar en `null` si la asignatura no tiene panel propio.
 */
export interface Subject {
    id: string;
    scheduleId: string;
    name: string;
    color: string;
    panelRef: DocumentReference | null;
    exam: SubjectExamInfo | SubjectNoExamInfo | null;
    isArchived: boolean;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}
export type CreateSubjectDTO = Omit<Subject, "id" | "isArchived">;
export type UpdateSubjectDTO = Partial<Omit<CreateSubjectDTO, "createdAt" | "scheduleId">>;
export declare function hasExam(exam: Subject["exam"]): exam is SubjectExamInfo;
