import type { TasksService } from "../../app/task.service";
import { type AnyTask, type CreateAnyTaskDTO, type UpdateAnyTaskDTO } from "../../domain/task.entity";
import { type PropsWithChildren } from "react";
import { type TasksState } from "./taskReducer";
type TasksContextValue = {
    state: TasksState;
    fetchTasks: () => Promise<void>;
    createTask: (data: CreateAnyTaskDTO[]) => Promise<void>;
    updateTask: (id: string, data: UpdateAnyTaskDTO) => Promise<void>;
    completeTask: (id: string) => Promise<void>;
    deleteTask: (id: string) => Promise<void>;
    selectTask: (task: AnyTask) => void;
    clearError: () => void;
};
export declare const TasksContext: import("react").Context<TasksContextValue | undefined>;
type TasksProviderProps = PropsWithChildren<{
    tasksService: TasksService;
}>;
export declare function TasksProvider({ children, tasksService }: TasksProviderProps): import("react").JSX.Element;
export {};
