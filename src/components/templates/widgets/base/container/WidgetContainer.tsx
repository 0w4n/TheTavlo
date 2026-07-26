import { useEffect, useRef, useState } from "react";
import { Button } from "#components/atoms/button";
import type {
  Widget,
  WidgetType,
} from "#features/widgets/domain/widget.entity";
import Icon from "#shared/ui/atoms/icons";
import WidgetContent from "../content/WidgetContent";
import { GetDialogWdigetType } from "./utils";
import { Dropdown } from "#components/molecules/dropdown";
import AddShared from "#components/templates/dialog/modShared/addShared";

import "./widgetContainer.css";
import useWidgets from "#features/widgets/presentation/hooks/useWidgets";
import ModalPortal from "#components/molecules/modal/portal";
import { DelWidget } from "#components/templates/dialog/modWidget/delWidget";

export default function WidgetContainer({
  type,
  widget,
  editMode,
}: {
  type: WidgetType;
  widget: Widget;
  editMode: boolean;
  onResize?: (layout: Widget["layout"]) => void;
}) {
  const [_search, setSearch] = useState("");
  const actionTrigers = {
    iconTrigger: "IconDotsVertical",
    options: [
      {
        label: "Compartir",
        icon: "IconUserPlus",
        onClick: () => console.log("Opción 1 seleccionada"),
        render: (onClose: () => void) => (
          <AddShared type="widget" onClose={onClose} />
        ),
        portalModal: true,
      },
      {
        label: "Ajustes",
        icon: "IconSettings",
        onClick: () => console.log("Opción 2 seleccionada"),
      },
      {
        label: "Bloquear",
        icon: "IconLock",
        onClick: () => console.log("Opción 3 seleccionada"),
      },
      {
        label: "Eliminar",
        icon: "IconTrash",
        danger: true,
        onClick: () => console.log("Opción 4 seleccionada"),
        render: (onClose: () => void) => (
          <DelWidget onDelete={handleRemoving} onClose={onClose} />
        ),
        portalModal: true,
      },
    ],
  };

  const contentRef = useRef<HTMLDivElement>(null);

  // 🔹 Detectar overflow y aplicar clase
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const update = () => {
      const hasOverflow = el.scrollHeight > el.clientHeight;
      el.classList.toggle("widget__content-scroll", hasOverflow);
    };

    // Inicial
    update();

    // Resize del contenedor
    const resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(el);

    // Cambios en el DOM interno
    const mutationObserver = new MutationObserver(update);
    mutationObserver.observe(el, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    // Resize de ventana (por si cambia layout global)
    window.addEventListener("resize", update);

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  const { removeWidget } = useWidgets();

  const handleRemoving = async () => {
    removeWidget(widget.id);
  };

  return (
    <div className="widget" style={{ cursor: editMode ? "grab" : "default" }}>
      <div className="widget__header">
        {/* <div>
          <Icon name={getIconWidgetType(widget.type)} />
        </div> */}
        <div className="widget__header-searchBar">
          <Icon name={"IconSearch"} />
          <input type="text" placeholder="Búscame" onChange={(e) => setSearch(e.target.value)} className="widget__header-searchBar-input"/>
        </div>
        <Button variant="primary" icon="IconFilter2" iconSize={16}/>
        <div>
          {editMode && !widget.locked && (
            <Button
              variant="danger"
              onClick={handleRemoving}
              iconSize={16}
              icon="IconTrash"
              className="configButton"
            />
          )}

          <Dropdown
            trigger={
              <Button
                variant="ghost"
                size="sm"
                iconSize={16}
                icon="IconDotsVertical"
                className="configButton"
              />
            }
          >
            {actionTrigers.options.map((option, index) =>
              option.portalModal ? (
                <Dropdown.Item
                  key={index}
                  label={option.label}
                  icon={option.icon}
                  danger={option.danger}
                  render={option.render}
                  portalModal
                />
              ) : (
                <Dropdown.Item
                  key={index}
                  label={option.label}
                  icon={option.icon}
                  danger={option.danger}
                  onClick={option.onClick}
                />
              ),
            )}
          </Dropdown>
        </div>
      </div>

      <div ref={contentRef} className="widget__content">
        <WidgetContent widget={widget} />
        <ModalPortal label={type} iconName="IconPlus">
          {(onClose: () => void) => (
            <GetDialogWdigetType widgetType={type} onClose={onClose} />
          )}
        </ModalPortal>
        {/* <div className="widget__content-add">
          <Icon name={"IconPlus"} strokeWidth={2.0} size={32} />
          <div className="widget__content-add-text">
            <span></span>
          </div>
        </div> */}
      </div>
    </div>
  );
}
