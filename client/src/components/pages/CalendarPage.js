import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useEvents } from "#features/events/presentation/hooks/useEvents";
/**
 * "/calendar" de un panel — distinto de "/home/calendar" (vista global, hoy
 * "En construcción"). Igual que TaskListPage, la maqueta visual queda fuera
 * de alcance; lo que importa acá es que recibe siempre el último `:pid` de
 * la cadena, resuelto y validado por el loader.
 */
export default function CalendarPage({ panel }) {
    const { state } = useEvents();
    const status = state.status;
    return (_jsxs("section", { className: "calendar-page", children: [_jsxs("h1", { children: ["Calendario \u2014 ", panel.name || "Panel"] }), status === "loading" && _jsx("p", { children: "Cargando eventos\u2026" }), status === "error" && (_jsxs("p", { role: "alert", children: [state.error?.code, " ", state.error?.message] })), status === "events" && state.event.length === 0 && (_jsx("p", { children: "No hay eventos todav\u00EDa en este panel." })), status === "events" && state.event.length > 0 && (_jsx("ul", { children: state.event.map((event) => (_jsx("li", { children: event.name }, event.id))) }))] }));
}
