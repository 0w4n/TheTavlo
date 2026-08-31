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
import { err, firebaseErr, isErr, unexpectedErr, type AppErr, type ResultApp } from "#core/appCore/domain/AppCore.type";

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
        payload: firebaseErr("Error al cargar tareas"),
      });
    }
  }, [tasksService]);

  // ─── Mutaciones ──────────────────────────────────────────────────────────

  const createTask = useCallback(
    async (data: CreateAnyTaskDTO[]) => {
      for (const element of data) {
        let result: ResultApp<AnyTask, AppErr>;

        if (isCreateNodeTask(element) || isCreateTask(element)) {
          result = await tasksService.createAnyTask(element);
        } else {
          result = err(unexpectedErr("Tipo de tarea desconocido"));
          result = err(unexpectedErr("Tipo de tarea desconocido"));
        }

        if (isErr(result)) {
          dispatch({ type: "FETCH_TASKS_ERROR", payload: result.err });
          throw result;
        }

        // Optimistic: onSnapshot también lo reflejará
        dispatch({ type: "CREATE_TASK_SUCCESS", payload: result.value });
      }
    },
    [tasksService],
  );

  const updateTask = useCallback(
    async (id: string, data: UpdateAnyTaskDTO) => {
      const result = await tasksService.updateAnyTask(id, data);
      
      if (isErr(result)) {
        dispatch({ type: "FETCH_TASKS_ERROR", payload: result.err });
        throw result;
      }
      dispatch({ type: "UPDATE_TASK_SUCCESS", payload: result.value });
    },
    [tasksService],
  );

  const completeTask = useCallback(
    async (id: string) => {
      const result = await tasksService.completeTask(id);
      
      if (isErr(result)) {
        dispatch({ type: "FETCH_TASKS_ERROR", payload: result.err });
        throw result;
      }
      dispatch({ type: "UPDATE_TASK_SUCCESS", payload: result.value });
    },
    [tasksService],
  );

  const deleteTask = useCallback(
    async (id: string) => {
      const result = await tasksService.deleteTask(id);
      
      if (isErr(result)) {
        dispatch({ type: "FETCH_TASKS_ERROR", payload: result.err });
        throw result;
      }
      dispatch({ type: "DELETE_TASK_SUCCESS", payload: id });
    },
    [tasksService],
  );

  const selectTask = useCallback((task: AnyTask) => {
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
