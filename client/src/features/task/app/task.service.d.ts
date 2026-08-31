import type { Unsubscribe } from "firebase/firestore";
import { TaskProgress, type CreateAnyTaskDTO, type UpdateAnyTaskDTO, type AnyTask } from "../domain/task.entity";
import type { TaskRepository } from "./taskRepository.interface";
import { type AppErr, type ResultApp } from "#core/appCore/domain/AppCore.type";
export declare class TasksService {
    private repository;
    constructor(repository: TaskRepository);
    /**
     * Escucha las tareas del panel activo en tiempo real.
     * Llama a onData con la lista completa ante cualquier cambio.
     * Devuelve la función de limpieza — llamarla para cancelar la suscripción.
     */
    subscribe(onData: (tasks: AnyTask[]) => void, onError: (err: AppErr) => void): Unsubscribe;
    getAllTasks(): Promise<AnyTask[]>;
    getTaskById(id: string): Promise<AnyTask | null>;
    createAnyTask(data: CreateAnyTaskDTO): Promise<ResultApp<AnyTask, AppErr>>;
    updateAnyTask(id: string, data: UpdateAnyTaskDTO): Promise<ResultApp<AnyTask, AppErr>>;
    completeTask(id: string): Promise<ResultApp<AnyTask, AppErr>>;
    deleteTask(id: string): Promise<ResultApp<boolean, AppErr>>;
    getOverdueTasks(): Promise<AnyTask[]>;
    getTasksByProgress(progress: TaskProgress): Promise<AnyTask[]>;
}
