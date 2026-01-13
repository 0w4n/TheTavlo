import type { TasksService } from "../../app/task.service";
import type {
  CreateTaskDTO,
  Task,
  UpdateTaskDTO,
} from "../../domain/task.entity";
import {
  createContext,
  useReducer,
  useCallback,
  useEffect,
  type PropsWithChildren,
} from "react";
import {
  initialTasksState,
  tasksReducer,
  type TasksState,
} from "./taskReducer";

type TasksContextValue = {
  state: TasksState;
  fetchTasks: () => Promise<void>;
  createTask: (data: CreateTaskDTO) => Promise<void>;
  updateTask: (id: string, data: UpdateTaskDTO) => Promise<void>;
  completeTask: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  selectTask: (task: Task | null) => void;
  clearError: () => void;
};

export const TasksContext = createContext<TasksContextValue | null>(null);

type TasksProviderProps = PropsWithChildren<{
  tasksService: TasksService;
}>;

export function TasksProvider({ children, tasksService }: TasksProviderProps) {
  const [state, dispatch] = useReducer(tasksReducer, initialTasksState);

  const fetchTasks = useCallback(async () => {
    dispatch({ type: "FETCH_TASKS_START" });
    try {
      const tasks = await tasksService.getAllTasks();
      dispatch({ type: "FETCH_TASKS_SUCCESS", payload: tasks });
    } catch (error) {
      dispatch({
        type: "FETCH_TASKS_ERROR",
        payload: "Error al cargar tareas",
      });
    }
  }, [tasksService]);

  const createTask = useCallback(
    async (data: CreateTaskDTO) => {
      const result = await tasksService.createTask(data);

      if (result.error) {
        dispatch({ type: "FETCH_TASKS_ERROR", payload: result.error });
        throw new Error(result.error);
      }

      if (result.task) {
        dispatch({ type: "CREATE_TASK_SUCCESS", payload: result.task });
      }
    },
    [tasksService]
  );

  const updateTask = useCallback(
    async (id: string, data: UpdateTaskDTO) => {
      const result = await tasksService.updateTask(id, data);

      if (result.error) {
        dispatch({ type: "FETCH_TASKS_ERROR", payload: result.error });
        throw new Error(result.error);
      }

      if (result.task) {
        dispatch({ type: "UPDATE_TASK_SUCCESS", payload: result.task });
      }
    },
    [tasksService]
  );

  const completeTask = useCallback(
    async (id: string) => {
      const result = await tasksService.completeTask(id);

      if (result.error) {
        dispatch({ type: "FETCH_TASKS_ERROR", payload: result.error });
        throw new Error(result.error);
      }

      if (result.task) {
        dispatch({ type: "UPDATE_TASK_SUCCESS", payload: result.task });
      }
    },
    [tasksService]
  );

  const deleteTask = useCallback(
    async (id: string) => {
      const result = await tasksService.deleteTask(id);

      if (result.error) {
        dispatch({ type: "FETCH_TASKS_ERROR", payload: result.error });
        throw new Error(result.error);
      }

      dispatch({ type: "DELETE_TASK_SUCCESS", payload: id });
    },
    [tasksService]
  );

  const selectTask = useCallback((task: Task | null) => {
    dispatch({ type: "SELECT_TASK", payload: task });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: "CLEAR_ERROR" });
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const value: TasksContextValue = {
    state,
    fetchTasks,
    createTask,
    updateTask,
    completeTask,
    deleteTask,
    selectTask,
    clearError,
  };
  return (
    <TasksContext.Provider value={value}>{children}</TasksContext.Provider>
  );
}
