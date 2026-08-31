import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import { Button } from "#components/atoms/button";
import Icon from "#shared/ui/atoms/icons";
import WidgetContent from "../content/WidgetContent";
import { GetDialogWdigetType } from "./utils";
import { Dropdown } from "#components/molecules/dropdown";
import "./widgetContainer.css";
import useWidgets from "#features/widgets/presentation/hooks/useWidgets";
import ModalPortal from "#components/molecules/modal/portal";
import { DelWidget } from "#components/templates/dialog/modWidget/delWidget";
import { usePanelRole } from "#features/invitations/presentation/hooks/usePanelRole";
export default function WidgetContainer({ type, widget, editMode, }) {
    const [_search, setSearch] = useState("");
    const [enable, _setEnable] = useState(false);
    // const [multipleSelecction, setMultipleSelecction] = useState([]);
    // Compartir/eliminar son acciones de EDITOR (o dueño) hacia arriba — un
    // VIEWER no debe verlas (Q3: "ambos" — esto es solo la mitad de UX, la
    // barrera real está en firestore.rules + invitations.router.ts).
    const panelRole = usePanelRole();
    const canManage = panelRole === "owner" || panelRole === "editor";
    const actionTrigers = {
        iconTrigger: "IconDotsVertical",
        options: [
            {
                label: "Card",
                icon: "IconGrid",
                onClick: () => console.log("Opción 2 seleccionada"),
            },
            {
                label: "List",
                icon: "IconList",
                onClick: () => console.log("Opción 2 seleccionada"),
            },
            {
                label: "Bloquear",
                icon: "IconPin",
                onClick: () => console.log("Opción 3 seleccionada"),
            },
            ...(canManage
                ? [
                    {
                        label: "Eliminar",
                        icon: "IconTrash",
                        danger: true,
                        onClick: () => console.log("Opción 4 seleccionada"),
                        render: (onClose) => (_jsx(DelWidget, { onDelete: handleRemoving, onClose: onClose })),
                        portalModal: true,
                    },
                ]
                : []),
            {
                label: "Ver archivados",
                icon: "IconArchive",
                onClick: () => console.log("Opción 5 seleccionada"),
            },
            {
                label: "Selección múltiple",
                icon: "IconSquareRoundedCheck",
                onClick: () => console.log("Opción 6 seleccionada"),
            },
        ],
    };
    const contentRef = useRef(null);
    // 🔹 Detectar overflow y aplicar clase
    useEffect(() => {
        const el = contentRef.current;
        if (!el)
            return;
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
    return (_jsxs("div", { className: "widget", style: { cursor: editMode ? "grab" : "default" }, children: [_jsxs("div", { className: "widget__header", children: [_jsxs("div", { className: "widget__header-searchBar", children: [_jsx(Icon, { name: "IconSearch" }), _jsx("input", { type: "text", placeholder: "B\u00FAscame", onChange: (e) => setSearch(e.target.value), className: "widget__header-searchBar-input" })] }), _jsx(Button, { variant: "primary", icon: "IconFilter2", iconSize: 16 }), _jsxs("div", { children: [editMode && !widget.locked && (_jsx(Button, { variant: "danger", onClick: handleRemoving, iconSize: 16, icon: "IconTrash", className: "configButton" })), _jsx(Dropdown, { trigger: _jsx(Button, { variant: "ghost", size: "sm", iconSize: 16, icon: "IconDotsVertical", className: "configButton" }), children: actionTrigers.options.map((option, index) => option.portalModal ? (_jsx(Dropdown.Item, { label: option.label, icon: option.icon, danger: option.danger, render: option.render, portalModal: true }, index)) : (_jsx(Dropdown.Item, { label: option.label, icon: option.icon, danger: option.danger, onClick: option.onClick }, index))) })] })] }), _jsxs("div", { ref: contentRef, className: "widget__content", children: [_jsx(WidgetContent, { widget: widget, multiSelection: enable }), _jsx(ModalPortal, { label: type, iconName: "IconPlus", children: (onClose) => (_jsx(GetDialogWdigetType, { widgetType: type, onClose: onClose })) })] })] }));
}
