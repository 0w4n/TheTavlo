import type { Task } from "../../domain/task.entity";

export type TasksState = {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  selectedTask: Task | null;
};

type TasksAction =
  | { type: "FETCH_TASKS_START" }
  | { type: "FETCH_TASKS_SUCCESS"; payload: Task[] }
  | { type: "FETCH_TASKS_ERROR"; payload: string }
  | { type: "CREATE_TASK_SUCCESS"; payload: Task }
  | { type: "UPDATE_TASK_SUCCESS"; payload: Task }
  | { type: "DELETE_TASK_SUCCESS"; payload: string }
  | { type: "SELECT_TASK"; payload: Task | null }
  | { type: "CLEAR_ERROR" };

export const initialTasksState: TasksState = {
  tasks: [],
  loading: false,
  error: null,
  selectedTask: null,
};

export function tasksReducer(
  state: TasksState,
  action: TasksAction
): TasksState {
  switch (action.type) {
    case "FETCH_TASKS_START":
      return { ...state, loading: true, error: null };

    case "FETCH_TASKS_SUCCESS":
      return { ...state, loading: false, tasks: action.payload };

    case "FETCH_TASKS_ERROR":
      return { ...state, loading: false, error: action.payload };

    case "CREATE_TASK_SUCCESS":
      return {
        ...state,
        tasks: [...state.tasks, action.payload],
        error: null,
      };

    case "UPDATE_TASK_SUCCESS":
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload.id ? action.payload : task
        ),
        error: null,
      };

    case "DELETE_TASK_SUCCESS":
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== action.payload),
        error: null,
      };

    case "SELECT_TASK":
      return { ...state, selectedTask: action.payload };

    case "CLEAR_ERROR":
      return { ...state, error: null };

    default:
      return state;
  }
}
