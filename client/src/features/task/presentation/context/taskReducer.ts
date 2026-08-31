import type { AppErr } from "#core/appCore/domain/AppCore.type";
import type { AnyTask } from "../../domain/task.entity";

export type TasksState =
  | {
      status: "loading";
    }
  | {
      status: "task";
      selectedTask?: AnyTask;
      currentTask: AnyTask[];
    }
  | {
      status: "error";
      error?: AppErr;
    };

type TasksAction =
  | { type: "FETCH_TASKS_START" }
  | { type: "FETCH_TASKS_SUCCESS"; payload: AnyTask[] }
  | { type: "FETCH_TASKS_ERROR"; payload: AppErr }
  | { type: "CREATE_TASK_SUCCESS"; payload: AnyTask }
  | { type: "UPDATE_TASK_SUCCESS"; payload: AnyTask }
  | { type: "DELETE_TASK_SUCCESS"; payload: string }
  | { type: "SELECT_TASK"; payload: AnyTask }
  | { type: "CLEAR_ERROR" };

export const initialTasksState: TasksState = {
  status: "loading",
};

export function tasksReducer(
  state: TasksState,
  action: TasksAction,
): TasksState {
  switch (action.type) {
    case "FETCH_TASKS_START":
      return { status: "loading" };

    case "FETCH_TASKS_SUCCESS":
      return { status: "task", currentTask: action.payload };

    case "FETCH_TASKS_ERROR":
      return { status: "error", error: action.payload };

    case "CREATE_TASK_SUCCESS":
      return state;

    case "UPDATE_TASK_SUCCESS":
      if (state.status !== "task") return state;

      return {
        ...state,
        selectedTask:
          state.selectedTask?.id === action.payload.id
            ? action.payload
            : state.selectedTask,
        currentTask: state.currentTask.map((task) => {
          return task.id === action.payload.id ? action.payload : task;
        }),
      };

    case "DELETE_TASK_SUCCESS":
      if (state.status !== "task") return state;

      return {
        ...state,
        currentTask: state.currentTask.filter(
          (task) => task.id !== action.payload,
        ),
        selectedTask: undefined,
      };

    case "SELECT_TASK":
      if (state.status !== "task") return state;

      return { ...state, selectedTask: action.payload };

    case "CLEAR_ERROR":
      return { status:"error", error: undefined };

    default:
      return state;
  }
}
