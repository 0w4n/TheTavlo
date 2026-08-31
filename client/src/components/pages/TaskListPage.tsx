import type { Panel } from "#features/panels/domain/panel.entity";
import useTasks from "#features/task/presentation/hooks/useTask";

/**
 * "/task" — todas las tareas del último panel de la cadena.
 *
 * Implementación mínima a propósito: la maqueta de tarjetas/columnas queda
 * fuera del alcance de este cambio (que es sobre routing). El contrato con
 * el router ya queda resuelto: esta página recibe siempre exactamente un
 * `panel` (el último `:pid` de la URL), nunca la lista completa de paneles
 * anidados — esa regla ("solo se ven las tareas del último :pid") la
 * garantiza `panelPath.ts`, no este componente.
 */
export default function TaskListPage({ panel }: { panel: Panel }) {
  const { state } = useTasks();

  return (
    <section className="task-list-page">
      <h1>Tareas — {panel.name || "Panel"}</h1>

      {state.status === "loading" && <p>Cargando tareas…</p>}
      {state.status === "error" && <p role="alert">{state.error?.message}</p>}

      {state.status === "task" && state.currentTask.length === 0 && (
        <p>No hay tareas todavía en este panel.</p>
      )}

      <ul>
        {state.status === "task" &&
          state.currentTask.map((task) => <li key={task.id}>{task.title}</li>)}
      </ul>
    </section>
  );
}
