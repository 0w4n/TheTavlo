import type { Panel } from "#features/panels/domain/panel.entity";
/**
 * "/calendar" de un panel — distinto de "/home/calendar" (vista global, hoy
 * "En construcción"). Igual que TaskListPage, la maqueta visual queda fuera
 * de alcance; lo que importa acá es que recibe siempre el último `:pid` de
 * la cadena, resuelto y validado por el loader.
 */
export default function CalendarPage({ panel }: {
    panel: Panel;
}): import("react").JSX.Element;
