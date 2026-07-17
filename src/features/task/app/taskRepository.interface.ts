import type { Unsubscribe } from "firebase/auth";
import type {
  CreateAnyTaskDTO,
  AnyTask,
  UpdateAnyTaskDTO,
} from "../domain/task.entity";

export interface TaskRepository {
  subscribe(
    onData: (tasks: AnyTask[]) => void,
    onError: (err: Error) => void,
  ): Unsubscribe;
  findAll(): Promise<AnyTask[]>;
  findById(id: string): Promise<AnyTask | null>;
  create(data: CreateAnyTaskDTO): Promise<AnyTask>;
  update(id: string, data: UpdateAnyTaskDTO): Promise<AnyTask>;
  delete(id: string): Promise<void>;
}
