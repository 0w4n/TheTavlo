import type { Panel } from "#features/panels/domain/panel.entity";
import { useEvents } from "#features/events/presentation/hooks/useEvents";

/**
 * "/calendar" de un panel — distinto de "/home/calendar" (vista global, hoy
 * "En construcción"). Igual que TaskListPage, la maqueta visual queda fuera
 * de alcance; lo que importa acá es que recibe siempre el último `:pid` de
 * la cadena, resuelto y validado por el loader.
 */
export default function CalendarListPage({ panel }: { panel: Panel }) {
  const { state } = useEvents();

  return (
    <section className="calendar-page">
      <h1>Calendario — {panel.name || "Panel"}</h1>

      {state.status === "loading" && <p>Cargando eventos…</p>}
      
      {state.status === "error" && <p role="alert">{state.error?.message}</p>}

      {state.status === "events" && state.event.length === 0 && (
        <p>No hay eventos todavía en este panel.</p>
      )}

      {state.status === "events" && state.event.length > 0 && (
        <>
          <p>Eventos en este panel:</p>
          <ul>
            {state.event.map((event) => (
              <li key={event.id}>{event.name}</li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
