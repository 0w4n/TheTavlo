import { useMemo } from "react";
import type { StatisticInputState } from "#features/statistic/domain/statistic.types";
import useTasks from "../presentation/hooks/useTask";
import { toLeafTasks, type TaskStatisticsInput } from "./taskMetrics";

/**
 * Puente entre el contexto de tareas y el host de estadísticas: la Feature
 * "task" traduce SU estado (`TasksState`) al estado genérico que entiende el
 * host. El host nunca importa `TasksContext`.
 */
export function useTaskStatisticsInput(): StatisticInputState<TaskStatisticsInput> {
  const { state } = useTasks();

  return useMemo<StatisticInputState<TaskStatisticsInput>>(() => {
    switch (state.status) {
      case "loading":
        return { status: "loading" };
      case "error":
        return {
          status: "error",
          message: state.error?.message ?? "No se pudieron cargar las tareas.",
        };
      case "task":
        return {
          status: "ready",
          data: { tasks: toLeafTasks(state.currentTask) },
        };
    }
  }, [state]);
}
