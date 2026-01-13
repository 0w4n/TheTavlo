import type { CreateTaskDTO, Task, UpdateTaskDTO } from "../domain/task.entity";

export interface TaskRepository {
  findAll(): Promise<Task[]>;
  findById(id: string): Promise<Task | null>;
  create(data: CreateTaskDTO): Promise<Task>;
  update(id: string, data: UpdateTaskDTO): Promise<Task>;
  delete(id: string): Promise<void>;
}
