import { Timestamp } from "firebase/firestore"; // O la librería de Timestamp que uses
// ─── Type guards ──────────────────────────────────────────────────────────────
export function isGenericEvent(event) {
    return event.type === "generic";
}
export function isExamEvent(event) {
    return event.type === "exam";
}
export function isMeetingEvent(event) {
    return event.type === "meeting";
}
export function isOtherEvent(event) {
    return event.type === "other";
}
