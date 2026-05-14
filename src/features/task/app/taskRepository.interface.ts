import type { CreateAnyTaskDTO, Task, UpdateAnyTaskDTO } from "../domain/task.entity";

export interface TaskRepository {
  findAll(): Promise<Task[]>;
  findById(id: string): Promise<Task | null>;
  create(data: CreateAnyTaskDTO): Promise<Task>;
  update(id: string, data: UpdateAnyTaskDTO): Promise<Task>;
  delete(id: string): Promise<void>;
}
