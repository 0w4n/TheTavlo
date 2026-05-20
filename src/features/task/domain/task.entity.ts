import { DocumentReference, type Timestamp } from "firebase/firestore";

// ─── Enums ────────────────────────────────────────────────────────────────────

export enum TaskProgress {
  NOTSTARTED = "notStarted",
  INPROGRESS = "inProgress",
  SUBMITTED = "submitted",
}

export enum TaskPhase {
  UNSCHEDULED = "unscheduled",
  PLANNED = "planned",
  ACTIVE = "active",
  ENDED = "ended",
}

export enum TaskSubmission {
  ON_TIME = "onTime",
  LATE = "late",
}

// ─── Base ─────────────────────────────────────────────────────────────────────

// Campos mínimos que todo nodo del árbol comparte
interface TaskBase {
  id: string;
  title: string;
  openAt?: Timestamp;
  endAt: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Campos completos de una tarea operativa
interface TaskFields {
  progress: TaskProgress;
  phase: TaskPhase;
  submission?: TaskSubmission;
}

// ─── Nodos ────────────────────────────────────────────────────────────────────

// Tarea sin hijos: campos completos, sin mapa
export interface Task extends TaskBase, TaskFields {}

// Tarea que tiene hijos: colapsa a los campos mínimos + mapa de referencias
export interface NodeTask extends TaskBase {
  subTaskId: Map<number, DocumentReference>;
}

// Unión discriminada para el render
export type AnyTask = Task | NodeTask;

// ─── DTOs ─────────────────────────────────────────────────────────────────────

export type CreateNodeTaskDTO = Omit<NodeTask, "id">;
export type CreateTaskDTO = Omit<Task, "id">;
export type CreateAnyTaskDTO = CreateNodeTaskDTO | CreateTaskDTO;

export type UpdateNodeTaskDTO = Partial<Omit<NodeTask, "id" | "createdAt">>;
export type UpdateTaskDTO = Partial<Omit<Task, "id" | "createdAt">>;
export type UpdateAnyTaskDTO = UpdateNodeTaskDTO | UpdateTaskDTO;

// ─── Type guards ──────────────────────────────────────────────────────────────

export function isNodeTask(task: AnyTask): task is NodeTask {
  return "subTaskId" in task && !("progress" in task);
}

export function isCreateNodeTask(task: CreateAnyTaskDTO): task is CreateNodeTaskDTO {
  return "subTaskId" in task && !("progress" in task);
}

export function isUpdateNodeTask(task: UpdateAnyTaskDTO): task is UpdateNodeTaskDTO {
  return "subTaskId" in task && !("progress" in task);
}

export function isTask(task: AnyTask): task is Task {
  return !("subTaskId" in task);
}

export function isCreateTask(task: CreateAnyTaskDTO): task is CreateTaskDTO {
  return !("subTaskId" in task);
}

export function isUpdateTask(task: UpdateAnyTaskDTO): task is UpdateTaskDTO {
  return !("subTaskId" in task);
}