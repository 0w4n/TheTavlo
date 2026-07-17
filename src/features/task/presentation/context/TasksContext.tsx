import type { TasksService } from "../../app/task.service";
import {
  isCreateNodeTask,
  isCreateTask,
  type AnyTask,
  type CreateAnyTaskDTO,
  type UpdateAnyTaskDTO,
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
  createTask: (data: CreateAnyTaskDTO[]) => Promise<void>;
  updateTask: (id: string, data: UpdateAnyTaskDTO) => Promise<void>;
  completeTask: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  selectTask: (task: AnyTask | undefined) => void;
  clearError: () => void;
};

export const TasksContext = createContext<TasksContextValue | undefined>(
  undefined,
);

type TasksProviderProps = PropsWithChildren<{ tasksService: TasksService }>;

export function TasksProvider({ children, tasksService }: TasksProviderProps) {
  const [state, dispatch] = useReducer(tasksReducer, initialTasksState);

  // ─── Suscripción en tiempo real ──────────────────────────────────────────
  // tasksService cambia cuando panelId cambia (ver App.tsx / ProviderApp),
  // lo que recrea la suscripción automáticamente para el nuevo panel.

  useEffect(() => {
    dispatch({ type: "FETCH_TASKS_START" });

    const unsubscribe = tasksService.subscribe(
      (tasks) => dispatch({ type: "FETCH_TASKS_SUCCESS", payload: tasks }),
      (error) => dispatch({ type: "FETCH_TASKS_ERROR", payload: error }),
    );

    // Limpieza: cancela la suscripción de Firestore
    return unsubscribe;
  }, [tasksService]);

  // ─── Fetch puntual (por compatibilidad / refresh manual) ─────────────────

  const fetchTasks = useCallback(async () => {
    dispatch({ type: "FETCH_TASKS_START" });
    try {
      const tasks = await tasksService.getAllTasks();
      dispatch({ type: "FETCH_TASKS_SUCCESS", payload: tasks });
    } catch {
      dispatch({
        type: "FETCH_TASKS_ERROR",
        payload: Error("Error al cargar tareas"),
      });
    }
  }, [tasksService]);

  // ─── Mutaciones ──────────────────────────────────────────────────────────

  const createTask = useCallback(
    async (data: CreateAnyTaskDTO[]) => {
      for (const element of data) {
        let result: AnyTask | Error;

        if (isCreateNodeTask(element) || isCreateTask(element)) {
          result = await tasksService.createAnyTask(element);
        } else {
          result = Error("Tipo de tarea desconocido");
        }

        if (result instanceof Error) {
          dispatch({ type: "FETCH_TASKS_ERROR", payload: result });
          throw result;
        }

        // Optimistic: onSnapshot también lo reflejará
        dispatch({ type: "CREATE_TASK_SUCCESS", payload: result });
      }
    },
    [tasksService],
  );

  const updateTask = useCallback(
    async (id: string, data: UpdateAnyTaskDTO) => {
      const result = await tasksService.updateAnyTask(id, data);
      if (result instanceof Error) {
        dispatch({ type: "FETCH_TASKS_ERROR", payload: result });
        throw result;
      }
      dispatch({ type: "UPDATE_TASK_SUCCESS", payload: result });
    },
    [tasksService],
  );

  const completeTask = useCallback(
    async (id: string) => {
      const result = await tasksService.completeTask(id);
      if (result instanceof Error) {
        dispatch({ type: "FETCH_TASKS_ERROR", payload: result });
        throw result;
      }
      dispatch({ type: "UPDATE_TASK_SUCCESS", payload: result });
    },
    [tasksService],
  );

  const deleteTask = useCallback(
    async (id: string) => {
      const result = await tasksService.deleteTask(id);
      if (result instanceof Error) {
        dispatch({ type: "FETCH_TASKS_ERROR", payload: result });
        throw result;
      }
      dispatch({ type: "DELETE_TASK_SUCCESS", payload: id });
    },
    [tasksService],
  );

  const selectTask = useCallback((task: AnyTask | undefined) => {
    dispatch({ type: "SELECT_TASK", payload: task });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: "CLEAR_ERROR" });
  }, []);

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
