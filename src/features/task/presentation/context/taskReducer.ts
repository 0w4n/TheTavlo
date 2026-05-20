import type { AnyTask } from "../../domain/task.entity";

export type TasksState = {
  tasks: AnyTask[];
  loading: boolean;
  error?: Error;
  selectedTask?: AnyTask;
};

type TasksAction =
  | { type: "FETCH_TASKS_START" }
  | { type: "FETCH_TASKS_SUCCESS"; payload: AnyTask[] }
  | { type: "FETCH_TASKS_ERROR"; payload: Error }
  | { type: "CREATE_TASK_SUCCESS"; payload: AnyTask }
  | { type: "UPDATE_TASK_SUCCESS"; payload: AnyTask }
  | { type: "DELETE_TASK_SUCCESS"; payload: string }
  | { type: "SELECT_TASK"; payload?: AnyTask }
  | { type: "CLEAR_ERROR" };

export const initialTasksState: TasksState = {
  tasks: [],
  loading: false,
  error: undefined,
  selectedTask: undefined,
};

export function tasksReducer(
  state: TasksState,
  action: TasksAction
): TasksState {
  switch (action.type) {
    case "FETCH_TASKS_START":
      return { ...state, loading: true, error: undefined };

    case "FETCH_TASKS_SUCCESS":
      return { ...state, loading: false, tasks: action.payload };

    case "FETCH_TASKS_ERROR":
      return { ...state, loading: false, error: action.payload };

    case "CREATE_TASK_SUCCESS":
      return {
        ...state,
        tasks: [...state.tasks, action.payload],
        error: undefined,
      };

    case "UPDATE_TASK_SUCCESS":
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload.id ? action.payload : task
        ),
        error: undefined,
      };

    case "DELETE_TASK_SUCCESS":
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== action.payload),
        error: undefined,
      };

    case "SELECT_TASK":
      return { ...state, selectedTask: action.payload };

    case "CLEAR_ERROR":
      return { ...state, error: undefined };

    default:
      return state;
  }
}
