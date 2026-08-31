import type { Panel } from "#features/panels/domain/panel.entity";
import "./breadcrumb.css";
export interface BreadcrumbProps {
    /** Cadena completa de paneles resuelta por el loader: [home, ..., actual]. */
    panels: Panel[];
    /**
     * Si la vista actual no es el dashboard del panel (p. ej. "Tareas" o
     * "Calendario"), va como último crumb, no navegable. Si se omite, el
     * propio panel actual es el crumb final.
     */
    currentLabel?: string;
    currentIcon?: string;
}
export default function Breadcrumb({ panels, currentLabel, currentIcon, }: BreadcrumbProps): import("react").JSX.Element | null;
