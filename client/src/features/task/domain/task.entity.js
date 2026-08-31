import { DocumentReference } from "firebase/firestore";
// ─── Enums ────────────────────────────────────────────────────────────────────
export var TaskProgress;
(function (TaskProgress) {
    TaskProgress["NOTSTARTED"] = "notStarted";
    TaskProgress["INPROGRESS"] = "inProgress";
    TaskProgress["SUBMITTED"] = "submitted";
})(TaskProgress || (TaskProgress = {}));
export var TaskPhase;
(function (TaskPhase) {
    TaskPhase["UNSCHEDULED"] = "unscheduled";
    TaskPhase["PLANNED"] = "planned";
    TaskPhase["ACTIVE"] = "active";
    TaskPhase["ENDED"] = "ended";
})(TaskPhase || (TaskPhase = {}));
export var TaskSubmission;
(function (TaskSubmission) {
    TaskSubmission["ON_TIME"] = "onTime";
    TaskSubmission["LATE"] = "late";
})(TaskSubmission || (TaskSubmission = {}));
// ─── Type guards ──────────────────────────────────────────────────────────────
export function isNodeTask(task) {
    return "subTaskId" in task && !("progress" in task);
}
export function isCreateNodeTask(task) {
    return "subTaskId" in task && !("progress" in task);
}
export function isUpdateNodeTask(task) {
    return "subTaskId" in task && !("progress" in task);
}
export function isTask(task) {
    return !("subTaskId" in task);
}
export function isCreateTask(task) {
    return !("subTaskId" in task);
}
export function isUpdateTask(task) {
    return !("subTaskId" in task);
}
