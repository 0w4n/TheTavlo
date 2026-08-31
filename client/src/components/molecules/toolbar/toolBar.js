import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { Button } from "#components/atoms/button";
import Icon from "#shared/ui/atoms/icons";
import "./toolBar.css";
import useWidgets from "#features/widgets/presentation/hooks/useWidgets";
import ModalPortal from "../modal/portal";
import { createPortal } from "react-dom";
import AddWidget from "#components/templates/dialog/modWidget/addWidget";
export function EditModeButton({ editMode, onToggle, }) {
    const { addWidget } = useWidgets();
    return (_jsxs(_Fragment, { children: [_jsx("div", { className: "EditModeButton", children: _jsx(Button, { variant: "primary", onClick: onToggle, label: editMode ? "Guardar dashboard" : "Editar dashboard", icon: editMode ? "IconCheck" : "IconPencil", iconSize: 16 }) }), editMode &&
                createPortal(_jsx(DashboardEditPanel, { onAdd: (type) => addWidget(type) }), document.body)] }));
}
function DashboardEditPanel({ onAdd, }) {
    return (_jsxs("div", { className: "DashboardEditPanel", children: [_jsx("span", { children: "\u2AF6\u2AF6" }), _jsx(ModalPortal, { iconName: "IconLayoutGridAdd", children: (onClose) => (_jsx(AddWidget, { onAddWidget: onAdd, onClose: onClose })) }), _jsx(Button, { title: "Mover", children: _jsx(Icon, { name: "IconArrowsMove" }) }), _jsx(Button, { title: "Redimensionar", children: _jsx(Icon, { name: "IconArrowsUpLeft" }) })] }));
}
