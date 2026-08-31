import { DocumentReference, type Timestamp } from "firebase/firestore";
export declare enum TaskProgress {
    NOTSTARTED = "notStarted",
    INPROGRESS = "inProgress",
    SUBMITTED = "submitted"
}
export declare enum TaskPhase {
    UNSCHEDULED = "unscheduled",
    PLANNED = "planned",
    ACTIVE = "active",
    ENDED = "ended"
}
export declare enum TaskSubmission {
    ON_TIME = "onTime",
    LATE = "late"
}
interface TaskBase {
    id: string;
    title: string;
    openAt: Timestamp | null;
    endAt: Timestamp;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}
interface TaskFields {
    progress: TaskProgress;
    phase: TaskPhase;
    submission: TaskSubmission | null;
}
export interface Task extends TaskBase, TaskFields {
}
export interface NodeTask extends TaskBase {
    subTaskId: Map<number, DocumentReference>;
}
export type AnyTask = Task | NodeTask;
export type CreateNodeTaskDTO = Omit<NodeTask, "id">;
export type CreateTaskDTO = Omit<Task, "id">;
export type CreateAnyTaskDTO = CreateNodeTaskDTO | CreateTaskDTO;
export type UpdateNodeTaskDTO = Partial<Omit<NodeTask, "id" | "createdAt">>;
export type UpdateTaskDTO = Partial<Omit<Task, "id" | "createdAt">>;
export type UpdateAnyTaskDTO = UpdateNodeTaskDTO | UpdateTaskDTO;
export declare function isNodeTask(task: AnyTask): task is NodeTask;
export declare function isCreateNodeTask(task: CreateAnyTaskDTO): task is CreateNodeTaskDTO;
export declare function isUpdateNodeTask(task: UpdateAnyTaskDTO): task is UpdateNodeTaskDTO;
export declare function isTask(task: AnyTask): task is Task;
export declare function isCreateTask(task: CreateAnyTaskDTO): task is CreateTaskDTO;
export declare function isUpdateTask(task: UpdateAnyTaskDTO): task is UpdateTaskDTO;
export {};
