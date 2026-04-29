import type { DocumentReference, Timestamp } from "firebase/firestore";

export interface Calendar {
    id: string;
    sharedId: DocumentReference;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export type CreateCalendarDTO = Omit<Calendar, "id">;
export type UpdateCalendarDTO = Omit<Calendar, "id" | "createdAt">;