import { Timestamp } from "firebase/firestore";
export type typeEvent = "generic" | "exam" | "meeting" | "other";
export type multidayCategory = "vacation" | "work_trip" | "conference" | "other";
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
};
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
export type CreateAnyEventDTO = Omit<AnyEvent, "id">;
export type UpdateAnyEventDTO = Omit<AnyEvent, "id" | "createAt">;
export declare function isGenericEvent(event: AnyEvent): event is GenericEvent;
export declare function isExamEvent(event: AnyEvent): event is ExamEvent;
export declare function isMeetingEvent(event: AnyEvent): event is MeetingEvent;
export declare function isOtherEvent(event: AnyEvent): event is OtherEvent;
export {};
