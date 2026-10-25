// Cálculos PUROS sobre tareas — sin React, sin Firestore, sin "ahora" implícito.
// Todo lo que depende del tiempo recibe `now` por parámetro, así los tests son
// deterministas y el host puede refrescar las estadísticas cada minuto.
//
// ── Una limitación conocida (y por qué se asume) ────────────────────────────
// `Task` no guarda "fecha de entrega": `TasksService.completeTask()` solo fija
// `progress = SUBMITTED` y `updatedAt = ahora`. Por eso `doneDate()` usa
// `updatedAt` como aproximación de "cuándo se entregó". Es exacta mientras la
// tarea no se edite después de entregarla. Si algún día se agrega
// `completedAt` a la entidad, basta con cambiar `doneDate()` — todo lo demás
// (rachas, actividad semanal, puntualidad) se corrige solo.

import {
  TaskProgress,
  TaskSubmission,
  isTask,
  type AnyTask,
  type Task,
} from "../domain/task.entity";

const DAY_MS = 86_400_000;

// ─── Entrada del plugin ─────────────────────────────────────────────────────

/** Lo que el plugin entrega al host. Solo tareas "hoja": los `NodeTask`
 *  (contenedores de subtareas) no tienen progreso y no cuentan. */
export interface TaskStatisticsInput {
  tasks: Task[];
}

export function toLeafTasks(all: readonly AnyTask[]): Task[] {
  return all.filter(isTask);
}

// ─── Fechas ─────────────────────────────────────────────────────────────────

/** Día calendario LOCAL como entero. Estable ante cambios de horario (DST):
 *  restar dos índices siempre da días enteros. */
export function dayIndex(date: Date): number {
  return Math.round(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / DAY_MS,
  );
}

/** Día calendario local `daysAgo` días antes de `from` (00:00 locales). */
export function startOfDayOffset(from: Date, daysAgo: number): Date {
  return new Date(from.getFullYear(), from.getMonth(), from.getDate() - daysAgo);
}

// ─── Predicados y accesos ───────────────────────────────────────────────────

export const isDone = (task: Task): boolean =>
  task.progress === TaskProgress.SUBMITTED;

export const dueDate = (task: Task): Date => task.endAt.toDate();

/** Aproximación de "cuándo se entregó" (ver nota al inicio del archivo). */
export const doneDate = (task: Task): Date => task.updatedAt.toDate();

export const isPending = (task: Task): boolean => !isDone(task);

export const isOverdue = (task: Task, now: Date): boolean =>
  isPending(task) && dueDate(task).getTime() < now.getTime();

/** ¿Se entregó tarde? Usa `submission` si está informado; si no (hoy
 *  `completeTask` no lo escribe), lo deduce comparando fechas. */
export function wasLate(task: Task): boolean {
  if (task.submission === TaskSubmission.LATE) return true;
  if (task.submission === TaskSubmission.ON_TIME) return false;
  return doneDate(task).getTime() > dueDate(task).getTime();
}

// ─── Progreso y estado ──────────────────────────────────────────────────────

export function completionCounts(tasks: readonly Task[]) {
  return { total: tasks.length, done: tasks.filter(isDone).length };
}

/** Reparto EXCLUYENTE: una tarea cae en un solo grupo.
 *  Entregada > vencida > en curso > sin empezar. */
export function statusBreakdown(tasks: readonly Task[], now: Date) {
  const result = { done: 0, overdue: 0, inProgress: 0, notStarted: 0 };

  for (const task of tasks) {
    if (isDone(task)) result.done++;
    else if (isOverdue(task, now)) result.overdue++;
    else if (task.progress === TaskProgress.INPROGRESS) result.inProgress++;
    else result.notStarted++;
  }

  return result;
}

// ─── Puntualidad ────────────────────────────────────────────────────────────

export function punctualityCounts(tasks: readonly Task[]) {
  const done = tasks.filter(isDone);
  const late = done.filter(wasLate).length;

  return { done: done.length, late, onTime: done.length - late };
}

/** Cuántas vencidas hay y cuántos días lleva la más antigua. */
export function overdueSummary(tasks: readonly Task[], now: Date) {
  const overdue = tasks.filter((t) => isOverdue(t, now));
  if (overdue.length === 0) return { count: 0, oldestDaysAgo: null };

  const oldest = Math.min(...overdue.map((t) => dueDate(t).getTime()));

  return {
    count: overdue.length,
    oldestDaysAgo: Math.floor((now.getTime() - oldest) / DAY_MS),
  };
}

/** Mediana de (plazo − entrega) en días. Positivo = entregas con antelación.
 *  Se usa mediana y no media: una sola entrega muy tardía no distorsiona. */
export function medianAnticipationDays(tasks: readonly Task[]): number | null {
  const deltas = tasks
    .filter(isDone)
    .map((t) => (dueDate(t).getTime() - doneDate(t).getTime()) / DAY_MS)
    .sort((a, b) => a - b);

  if (deltas.length === 0) return null;

  const mid = Math.floor(deltas.length / 2);
  return deltas.length % 2 === 1 ? deltas[mid] : (deltas[mid - 1] + deltas[mid]) / 2;
}

// ─── Actividad ──────────────────────────────────────────────────────────────

/** Entregas por día, de más antiguo a más reciente, terminando en el día de
 *  `now`. `days = 7` → [hace 6 días, ..., hoy]. */
export function completionsPerDay(
  tasks: readonly Task[],
  now: Date,
  days: number,
): number[] {
  const today = dayIndex(now);
  const counts = new Array<number>(days).fill(0);

  for (const task of tasks) {
    if (!isDone(task)) continue;
    const ago = today - dayIndex(doneDate(task));
    if (ago >= 0 && ago < days) counts[days - 1 - ago]++;
  }

  return counts;
}

/** Racha actual (días seguidos con ≥1 entrega) y mejor racha histórica.
 *  La racha de hoy no se "pierde" hasta que pase el día: si hoy aún no hay
 *  entregas, se cuenta desde ayer. */
export function deliveryStreaks(tasks: readonly Task[], now: Date) {
  const days = new Set(tasks.filter(isDone).map((t) => dayIndex(doneDate(t))));
  if (days.size === 0) return { current: 0, best: 0 };

  const today = dayIndex(now);
  let cursor = days.has(today) ? today : today - 1;
  let current = 0;
  while (days.has(cursor)) {
    current++;
    cursor--;
  }

  const sorted = [...days].sort((a, b) => a - b);
  let best = 1;
  let run = 1;
  for (let i = 1; i < sorted.length; i++) {
    run = sorted[i] === sorted[i - 1] + 1 ? run + 1 : 1;
    best = Math.max(best, run);
  }

  return { current, best: Math.max(best, current) };
}

/** Entregas por día de la semana. Índice = `Date.getDay()` (0 = domingo). */
export function completionsByWeekday(tasks: readonly Task[]): number[] {
  const counts = new Array<number>(7).fill(0);
  for (const task of tasks) {
    if (isDone(task)) counts[doneDate(task).getDay()]++;
  }
  return counts;
}

// ─── Carga futura ───────────────────────────────────────────────────────────

/** Pendientes (aún no vencidas) que vencen en cada bloque de 7 días desde hoy.
 *  Bloque 0 = hoy..+6 días, bloque 1 = +7..+13, etc. */
export function workloadByWeek(
  tasks: readonly Task[],
  now: Date,
  weeks: number,
): number[] {
  const counts = new Array<number>(weeks).fill(0);
  const today = dayIndex(now);

  for (const task of tasks) {
    if (!isPending(task) || isOverdue(task, now)) continue;
    const block = Math.floor((dayIndex(dueDate(task)) - today) / 7);
    if (block >= 0 && block < weeks) counts[block]++;
  }

  return counts;
}

/** Pendientes no vencidas que vencen dentro de los próximos `days` días
 *  (incluido hoy). */
export function dueWithinDays(
  tasks: readonly Task[],
  now: Date,
  days: number,
): number {
  const today = dayIndex(now);

  return tasks.filter((task) => {
    if (!isPending(task) || isOverdue(task, now)) return false;
    return dayIndex(dueDate(task)) - today < days;
  }).length;
}

/** Las próximas pendientes por vencer, de la más cercana a la más lejana. */
export function nextDeadlines(
  tasks: readonly Task[],
  now: Date,
  limit: number,
): Task[] {
  return tasks
    .filter((t) => isPending(t) && !isOverdue(t, now))
    .sort((a, b) => dueDate(a).getTime() - dueDate(b).getTime())
    .slice(0, limit);
}
