import { Timestamp } from "firebase/firestore"; // O la librería de Timestamp que uses

// Tipos auxiliares
export type typeEvent = "generic" | "exam" | "meeting" | "other";
export type multidayCategory =
  | "vacation"
  | "work_trip"
  | "conference"
  | "other";

interface ReminderInfo {
  rules: string;
}

interface RecurrenceInfo {
  rules: string;
  untilDate?: Timestamp;
}

interface MultiDayInfo {
  category: multidayCategory;
  startAt: Timestamp;
  endAt: Timestamp;
}

interface Event {
  id: string;
  name: string;
  type: typeEvent;

  multiday?: MultiDayInfo;
  reminder?: ReminderInfo;
  recurrence?: RecurrenceInfo;

  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface GenericEvent extends Event {
  type: "generic";
  startAt: Timestamp;
  endAt: Timestamp;
  description?: string;
  location?: string;
}

export interface ExamEvent extends Event {
  type: "exam";
  makeAt: Timestamp;
  time: number;
}

type MeetingLocation = {
  type: "physical" | "virtual";
  address: string;
}
export interface MeetingEvent extends Event {
  type: "meeting";
  startAt: Timestamp;
  endAt: Timestamp;
  location: MeetingLocation;
  participants?: string[];
}

export interface OtherEvent extends Event {
  type: "other";
  typeOther: string;
  startAt: Timestamp;
  endAt: Timestamp;
  description?: string;
}

export type AnyEvent = GenericEvent | ExamEvent | MeetingEvent | OtherEvent;

// ─── DTOs ──────────────────────────────────────────────────────────────

export type CreateAnyEventDTO = Omit<AnyEvent, "id">;
export type UpdateAnyEventDTO = Omit<AnyEvent, "id" | "createAt">;

// ─── Type guards ──────────────────────────────────────────────────────────────

export function isGenericEvent(event: AnyEvent): event is GenericEvent {
  return event.type === "generic";
}

export function isExamEvent(event: AnyEvent): event is ExamEvent {
  return event.type === "exam";
}

export function isMeetingEvent(event: AnyEvent): event is MeetingEvent {
  return event.type === "meeting";
}

export function isOtherEvent(event: AnyEvent): event is OtherEvent {
  return event.type === "other";
}
