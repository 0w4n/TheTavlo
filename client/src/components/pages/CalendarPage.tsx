import type { Panel } from "#features/panels/domain/panel.entity";
import { useEvents } from "#features/events/presentation/hooks/useEvents";

/**
 * "/calendar" de un panel — distinto de "/home/calendar" (vista global, hoy
 * "En construcción"). Igual que TaskListPage, la maqueta visual queda fuera
 * de alcance; lo que importa acá es que recibe siempre el último `:pid` de
 * la cadena, resuelto y validado por el loader.
 */
export default function CalendarPage({ panel }: { panel: Panel }) {
  const { state } = useEvents();

  const status = state.status;

  return (
    <section className="calendar-page">
      <h1>Calendario — {panel.name || "Panel"}</h1>

      {status === "loading" && <p>Cargando eventos…</p>}
      {status === "error" && (
        <p role="alert">
          {state.error?.code} {state.error?.message}
        </p>
      )}

      {status === "events" && state.event.length === 0 && (
        <p>No hay eventos todavía en este panel.</p>
      )}

      {status === "events" && state.event.length > 0 && (
        <ul>
          {state.event.map((event) => (
            <li key={event.id}>{event.name}</li>
          ))}
        </ul>
      )}
    </section>
  );
}
