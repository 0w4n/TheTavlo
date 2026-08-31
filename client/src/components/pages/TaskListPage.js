import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
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
export default function TaskListPage({ panel }) {
    const { state } = useTasks();
    return (_jsxs("section", { className: "task-list-page", children: [_jsxs("h1", { children: ["Tareas \u2014 ", panel.name || "Panel"] }), state.status === "loading" && _jsx("p", { children: "Cargando tareas\u2026" }), state.status === "error" && _jsx("p", { role: "alert", children: state.error?.message }), state.status === "task" && state.currentTask.length === 0 && (_jsx("p", { children: "No hay tareas todav\u00EDa en este panel." })), _jsx("ul", { children: state.status === "task" &&
                    state.currentTask.map((task) => _jsx("li", { children: task.title }, task.id)) })] }));
}
