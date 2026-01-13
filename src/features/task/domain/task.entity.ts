import type { Timestamp } from "firebase/firestore";

export type TaskStatus =
  | "not-started"
  | "in-progress"
  | "submitted"
  | "delayed";

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: "low" | "medium" | "high";
  status: TaskStatus;
  dueDate: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type CreateTaskDTO = Omit<Task, "id">;
export type UpdateTaskDTO = Partial<Omit<Task, "id" | "createdAt">>;
