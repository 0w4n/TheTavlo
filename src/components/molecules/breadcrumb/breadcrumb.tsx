import { Link, useNavigate } from "react-router-dom";
import type { Panel } from "#features/panels/domain/panel.entity";
import { buildPanelPath } from "#core/routing/panelPath";
import Icon from "#shared/ui/atoms/icons";
import { Dropdown } from "#components/molecules/dropdown";
import "./breadcrumb.css";

interface Crumb {
  id: string;
  label: string;
  icon?: string;
  href: string;
}

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

/** A partir de cuántos crumbs navegables colapsamos los del medio en un "…". */
const COLLAPSE_THRESHOLD = 3;

function panelCrumbs(panels: Panel[]): Crumb[] {
  return panels.map((panel, index) => {
    if (index === 0) {
      return {
        id: panel.id,
        label: panel.name || "Inicio",
        icon: "IconHome",
        href: "/home",
      };
    }

    const idsFromHome = panels.slice(1, index + 1).map((p) => p.id);
    return {
      id: panel.id,
      label: panel.name || "Panel",
      icon: panel.icon || "IconFolder",
      href: buildPanelPath(idsFromHome),
    };
  });
}

export default function Breadcrumb({
  panels,
  currentLabel,
  currentIcon,
}: BreadcrumbProps) {
  const navigate = useNavigate();

  if (panels.length === 0) return null;

  const allPanelCrumbs = panelCrumbs(panels);
  const hasViewCrumb = Boolean(currentLabel);

  // El último crumb ("acá estás") nunca es un link. Si hay una vista
  // (Tareas/Calendario) esa es el final; si no, lo es el propio panel.
  const linkable = hasViewCrumb
    ? allPanelCrumbs
    : allPanelCrumbs.slice(0, -1);
  const current = hasViewCrumb
    ? { label: currentLabel!, icon: currentIcon }
    : {
        label: allPanelCrumbs[allPanelCrumbs.length - 1].label,
        icon: allPanelCrumbs[allPanelCrumbs.length - 1].icon,
      };

  // Colapsar: dejar Inicio + los últimos dos ancestros visibles, ocultar el
  // resto atrás de un "…". Se complementa (no reemplaza) con scroll
  // horizontal por CSS para el caso extremo en que ni así entre — así no
  // dependemos de breakpoints específicos para que funcione en cualquier
  // ancho de pantalla.
  let visible = linkable;
  let hidden: Crumb[] = [];

  if (linkable.length > COLLAPSE_THRESHOLD) {
    const head = linkable[0];
    const tail = linkable.slice(-2);
    hidden = linkable.slice(1, linkable.length - 2);
    visible = [head, ...tail];
  }

  return (
    <nav aria-label="Ruta de navegación" className="breadcrumb">
      <ol className="breadcrumb__list">
        {visible.map((crumb, index) => (
          <li key={crumb.id} className="breadcrumb__item">
            <Link to={crumb.href} className="breadcrumb__link">
              {crumb.icon && (
                <Icon name={crumb.icon} size={14} aria-hidden="true" />
              )}
              <span className="breadcrumb__label">{crumb.label}</span>
            </Link>

            {/* El "…" va justo después de Inicio, antes de los últimos ancestros. */}
            {index === 0 && hidden.length > 0 && (
              <span className="breadcrumb__ellipsis-wrap">
                <Dropdown
                  trigger={
                    <button
                      type="button"
                      className="breadcrumb__ellipsis"
                      aria-label={`Mostrar ${hidden.length} paneles intermedios`}
                    >
                      <Icon name="IconDots" size={14} aria-hidden="true" />
                    </button>
                  }
                >
                  {hidden.map((hiddenCrumb) => (
                    <Dropdown.Item
                      key={hiddenCrumb.id}
                      icon={hiddenCrumb.icon || "IconFolder"}
                      label={hiddenCrumb.label}
                      onClick={() => navigate(hiddenCrumb.href)}
                    />
                  ))}
                </Dropdown>
              </span>
            )}
          </li>
        ))}

        <li
          className="breadcrumb__item breadcrumb__item--current"
          aria-current="page"
        >
          {current.icon && (
            <Icon name={current.icon} size={14} aria-hidden="true" />
          )}
          <span className="breadcrumb__label breadcrumb__label--current">
            {current.label}
          </span>
        </li>
      </ol>
    </nav>
  );
}
