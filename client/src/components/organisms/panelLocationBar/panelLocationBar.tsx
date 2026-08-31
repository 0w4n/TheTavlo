import { useEffect, type CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import type { Panel } from "#features/panels/domain/panel.entity";
import { buildPanelPath } from "#core/routing/panelPath";
import { useDocumentTitle } from "#core/routing/useDocumentTitle";
import useAnnounce from "#core/a11y/useAnnounce";
import { Button } from "#components/atoms/button";
import Icon from "#shared/ui/atoms/icons";
import Breadcrumb from "#components/molecules/breadcrumb/breadcrumb";
import "./panelLocationBar.css";

export interface PanelLocationBarProps {
  /** Cadena completa resuelta por el loader: [home, ..., panel actual]. */
  panels: Panel[];
  /** Nombre de la vista si es distinta del dashboard del panel (Tareas, Calendario). */
  viewLabel?: string;
  viewIcon?: string;
}

export default function PanelLocationBar({
  panels,
  viewLabel,
  viewIcon,
}: PanelLocationBarProps) {
  const navigate = useNavigate();
  const announce = useAnnounce();
  const panel = panels[panels.length - 1];
  const parent = panels.length > 1 ? panels[panels.length - 2] : null;

  const locationTitle = viewLabel ? `${panel.name} · ${viewLabel}` : panel.name;

  // Capa 2 — Ancla: mismo costo en cualquier ancho, a diferencia del
  // breadcrumb no necesita colapsar para seguir siendo legible.
  useDocumentTitle(locationTitle);

  // Capa 4 — Señal de sistema invisible: un usuario de lector de pantalla no
  // "ve" el breadcrumb cambiar de contenido tras una navegación de SPA si
  // nadie se lo anuncia explícitamente.
  useEffect(() => {
    announce(`Navegaste a ${locationTitle}`);
    // Solo re-anunciar si cambió la ubicación real, no en cada render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [panel.id, viewLabel]);

  const handleGoUp = () => {
    if (!parent) return;
    if (panels.length === 2) {
      // El padre es el panel home: volver ahí es "/home" directo, nunca un
      // buildPanelPath vacío (ver comentario en panelPath.ts).
      navigate("/home");
      return;
    }
    const parentIds = panels.slice(1, panels.length - 1).map((p) => p.id);
    navigate(buildPanelPath(parentIds));
  };

  const accentStyle = {
    "--panel-accent-h": panel.color,
  } as CSSProperties;

  return (
    <div className="panel-location-bar" style={accentStyle}>
      <div className="panel-location-bar__trail">
        {parent && (
          <Button
            variant="ghost"
            size="sm"
            icon="IconArrowLeft"
            iconSize={16}
            label={parent.name}
            onClick={handleGoUp}
            className="panel-location-bar__up"
            aria-label={`Subir a ${parent.name}`}
          />
        )}
        <Breadcrumb
          panels={panels}
          currentLabel={viewLabel}
          currentIcon={viewIcon}
        />
      </div>

      <h1 className="panel-location-bar__title">
        <Icon
          name={panel.icon || "IconFolder"}
          size={22}
          className="panel-location-bar__title-icon"
          aria-hidden="true"
        />
        <span className="panel-location-bar__title-text">{panel.name}</span>
        {viewLabel && (
          <span className="panel-location-bar__title-view">{viewLabel}</span>
        )}
      </h1>
    </div>
  );
}
