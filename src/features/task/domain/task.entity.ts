import type { Timestamp } from "firebase/firestore";

export type TaskStatus =
  | "notStarted"
  | "inProgress"
  | "submitted"
  | "delayed";

export interface Task {
  id: string;
  name: string;
  progress: TaskStatus;
  endLine: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type CreateTaskDTO = Omit<Task, "id">;
export type UpdateTaskDTO = Partial<Omit<Task, "id" | "createdAt">>;
