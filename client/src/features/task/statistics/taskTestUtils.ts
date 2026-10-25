// Utilidades SOLO para tests de estadísticas de tareas.
import { Timestamp } from "firebase/firestore";
import {
  TaskPhase,
  TaskProgress,
  type Task,
  type TaskSubmission,
} from "../domain/task.entity";

/** Domingo 25-oct-2026, mediodía (hora local). Fijo para tests deterministas. */
export const NOW = new Date(2026, 9, 25, 12, 0, 0);

/** `NOW` desplazado `days` días (puede ser negativo) y a la hora indicada. */
export function at(days: number, hour = 12, minute = 0): Date {
  return new Date(2026, 9, 25 + days, hour, minute, 0);
}

let counter = 0;

export function makeTask(overrides: {
  progress?: TaskProgress;
  /** Fecha límite. */
  due: Date;
  /** Cuándo se entregó (se guarda en `updatedAt`). */
  doneAt?: Date;
  submission?: TaskSubmission | null;
  title?: string;
}): Task {
  counter++;
  const created = Timestamp.fromDate(at(-60));

  return {
    id: `t${counter}`,
    title: overrides.title ?? `Tarea ${counter}`,
    openAt: null,
    endAt: Timestamp.fromDate(overrides.due),
    createdAt: created,
    updatedAt: overrides.doneAt ? Timestamp.fromDate(overrides.doneAt) : created,
    progress: overrides.progress ?? TaskProgress.NOTSTARTED,
    phase: TaskPhase.ACTIVE,
    submission: overrides.submission ?? null,
  };
}

/** Atajo: tarea entregada el día `doneDay` con plazo `dueDay` (días relativos a NOW). */
export function doneTask(doneDay: number, dueDay = doneDay + 1, hour = 12): Task {
  return makeTask({
    progress: TaskProgress.SUBMITTED,
    due: at(dueDay),
    doneAt: at(doneDay, hour),
  });
}
