import type { Panel } from "#features/panels/domain/panel.entity";
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
export default function TaskListPage({ panel }: {
    panel: Panel;
}): import("react").JSX.Element;
