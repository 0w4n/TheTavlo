import { useState } from "react";
import { Button } from "#components/atoms/button";
import Icon from "#shared/ui/atoms/icons";
import type {
  CreatePanelDTO,
  Panel,
  PanelConfig,
} from "#features/panels/domain/panel.entity";
import { Link } from "react-router-dom";
import usePanels from "#features/panels/presentation/hooks/usePanels";

import "./panelsWidget.css";
import { CheckBox } from "#components/atoms/checkbox/checkbox";

export default function PanelsWidget({
  items,
  config = { typeView: "list" },
  multiSelection
}: {
  items: Panel[] | undefined;
  config: PanelConfig;
  multiSelection: boolean;
}) {
  console.log("Multiselection: ", multiSelection);
  
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { archivePanel, deletePanelCascade } = usePanels();

  console.log(multiSelection);

  const toggleSelected = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((selectedId) => selectedId !== id)
        : [...current, id],
    );
  };

  const clearSelection = () => setSelectedIds([]);

  const archiveSelected = async () => {
    await Promise.all(selectedIds.map((id) => archivePanel(id)));
    clearSelection();
  };

  const deleteSelected = async () => {
    await Promise.all(selectedIds.map((id) => deletePanelCascade(id)));
    clearSelection();
  };

  const shareSelected = async () => {
    const selectedPanels = items?.filter((item) => selectedIds.includes(item.id));
    const text = selectedPanels?.map((panel) => panel.name).join(", ");
    const shareData = { title: "Paneles compartidos", text };

    if (navigator.share) {
      await navigator.share(shareData);
      return;
    }

    await navigator.clipboard?.writeText(
      `${shareData.title}: ${shareData.text ?? ""}`,
    );
  };

  if (!items || items.length === 0) {
    return <span>No hay paneles</span>;
  } else {
    return (
      <>
        <div
          className={`widgetContent__view--${config.typeView ? "list" : "list"}`}
        >
          {items.map((item) =>
            panelsItem(
              item,
              multiSelection,
              selectedIds.includes(item.id),
              () => toggleSelected(item.id),
            ),
          )}
        </div>
        {multiSelection && selectedIds.length > 0 && (
          <div
            className="panels__widget--actions"
            aria-label="Acciones de selección"
          >
            <span>{selectedIds.length} seleccionados</span>
            <Button
              variant="ghost"
              size="sm"
              icon="IconArchive"
              label="Archivar"
              onClick={archiveSelected}
            />
            <Button
              variant="ghost"
              size="sm"
              icon="IconShare"
              label="Compartir"
              onClick={shareSelected}
            />
            <Button
              variant="danger"
              size="sm"
              icon="IconTrash"
              label="Eliminar"
              onClick={deleteSelected}
            />
            <Button
              variant="ghost"
              size="sm"
              icon="IconX"
              aria-label="Cancelar selección"
              title="Cancelar selección"
              onClick={clearSelection}
            />
          </div>
        )}
      </>
    );
  }
}

function panelsItem(
  panel: Panel,
  multiSelection: boolean,
  selected: boolean,
  onToggle: () => void,
) {
  const { id, name, icon, color, sharedWith } = panel;
  const lightColor = `hsl(${color}, 100%, 70%)`;
  const darkColor = `hsl(${color}, 100%, 20%)`;

  const isIcon = icon.startsWith("Icon");

  const content = (
    <>
      {multiSelection && (
        <button
          type="button"
          className="panels__widget--checkButton"
          aria-label={`${selected ? "Quitar" : "Seleccionar"} ${name}`}
          aria-pressed={selected}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onToggle();
          }}
        >
          <Icon
            name={selected ? "IconSquareRoundedCheck" : "IconSquare"}
            color={lightColor}
            size={24}
          />
        </button>
      )}
      <div className="panels__widget--item__header">
        <div className="panels__widget--item__icon">
          {isIcon ? (
            <Icon name={icon} color={darkColor} size={32} />
          ) : (
            <span>{icon}</span>
          )}
        </div>
        {sharedWith && (
          <Icon name="IconUsersGroup" color={lightColor} size={24} />
        )}
      </div>
      <div className="panels__widget--item__name">
        <span>{name}</span>
        {multiSelection ? (<CheckBox variant="rounded" name="" id=""/>) : (
          <Icon
            name="IconArrowNarrowRightDashed"
            color={lightColor}
            size={32}
          />
        )}
      </div>
    </>
  );

  return multiSelection ? (
    <div
      key={id}
      className={`panels__widget--item${selected ? " is-selected" : ""}`}
      style={{ "--panels__widget--color": color } as React.CSSProperties}
      onClick={onToggle}
      role="option"
      aria-selected={selected}
    >
      {content}
    </div>
  ) : (
    <Link
      to={id}
      key={id}
      className="panels__widget--item"
      style={{ "--panels__widget--color": color } as React.CSSProperties}
    >
      {content}
    </Link>
  );
}

export function PanelPreview({ panel }: { panel: CreatePanelDTO }) {
  const { name, icon, color } = panel;
  // const lightColor = `hsl(${color}, 100%, 70%)`;
  const darkColor = `hsl(${color}, 100%, 20%)`;

  const isIcon = icon.startsWith("Icon");

  return (
    <div
      className="panels__widget--item panels__widget--item__preview"
      style={{ "--panels__widget--color": color } as React.CSSProperties}
    >
      <div className="panels__widget--item__header">
        {isIcon ? (
          <Icon
            className="panels__widget--item__icon"
            name={icon}
            size={32}
            color={darkColor}
          />
        ) : (
          <span className="panels__widget--item__icon">{icon}</span>
        )}
      </div>
      <div className="panels__widget--item__name">
        <span>{name}</span>
      </div>
    </div>
  );
}
