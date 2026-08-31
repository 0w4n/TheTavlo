import type { Panel } from "#features/panels/domain/panel.entity";
import "./panelLocationBar.css";
export interface PanelLocationBarProps {
    /** Cadena completa resuelta por el loader: [home, ..., panel actual]. */
    panels: Panel[];
    /** Nombre de la vista si es distinta del dashboard del panel (Tareas, Calendario). */
    viewLabel?: string;
    viewIcon?: string;
}
export default function PanelLocationBar({ panels, viewLabel, viewIcon, }: PanelLocationBarProps): import("react").JSX.Element;
