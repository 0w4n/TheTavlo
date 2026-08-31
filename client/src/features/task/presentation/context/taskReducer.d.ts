import type { AppErr } from "#core/appCore/domain/AppCore.type";
import type { AnyTask } from "../../domain/task.entity";
export type TasksState = {
    status: "loading";
} | {
    status: "task";
    selectedTask?: AnyTask;
    currentTask: AnyTask[];
} | {
    status: "error";
    error?: AppErr;
};
type TasksAction = {
    type: "FETCH_TASKS_START";
} | {
    type: "FETCH_TASKS_SUCCESS";
    payload: AnyTask[];
} | {
    type: "FETCH_TASKS_ERROR";
    payload: AppErr;
} | {
    type: "CREATE_TASK_SUCCESS";
    payload: AnyTask;
} | {
    type: "UPDATE_TASK_SUCCESS";
    payload: AnyTask;
} | {
    type: "DELETE_TASK_SUCCESS";
    payload: string;
} | {
    type: "SELECT_TASK";
    payload: AnyTask;
} | {
    type: "CLEAR_ERROR";
};
export declare const initialTasksState: TasksState;
export declare function tasksReducer(state: TasksState, action: TasksAction): TasksState;
export {};
