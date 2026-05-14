import type { Timestamp } from "firebase/firestore";

export type typeEvent = "generic" | "exam" | "multiDay" | "reminder";
export type multidayCategory =
  | "workshop"
  | "meeting"
  | "course"
  | "hackathon"
  | "other";

export interface Event {
  id: string;
  name: string;
  type: typeEvent;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface GenericEvent extends Event {
  type: "generic";
  startAt: Timestamp;
  endAt: Timestamp;
  location?: string;
}

export interface ExamEvent extends Event {
  type: "exam";
  makeAt: Timestamp;
}

export interface MultiDayEvent extends Event {
  type: "multiDay";
  category: multidayCategory;
  startAt: Timestamp;
  endAt: Timestamp;
  location: string;
}

export interface ReminderEvent extends Event {
  type: "reminder";
  isRecurring: boolean;
  recurrenceRule?: string;
}

export type AnyEvent = GenericEvent | ExamEvent | MultiDayEvent | ReminderEvent;

export type CreateAnyEventDTO = Omit<AnyEvent, "id">;
export type UpdateAnyEventDTO = Omit<AnyEvent, "id" | "createAt">;
