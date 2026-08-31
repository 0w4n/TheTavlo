import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Icon from "#shared/ui/atoms/icons";
import { Button } from "#components/atoms/button";
import "./header.css";
export function ModalHeader({ className = "", onClose, title, icon, ...props }) {
    return (_jsxs("div", { className: `modal__header ${className}`, ...props, children: [_jsxs("div", { className: "modal__header--content", children: [icon && _jsx(Icon, { name: icon }), _jsx("span", { className: "modal__header--content-title", children: title })] }), _jsx(Button, { className: "modal__close-button", onClick: () => onClose(false), "aria-label": "Cerrar modal", type: "button", icon: "IconX" })] }));
}
