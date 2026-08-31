import { jsx as _jsx } from "react/jsx-runtime";
import { Button } from "#components/atoms/button";
import ModalPortal from "#components/molecules/modal/portal";
import "./item.css";
export function DropdownItem({ icon, label, disabled = false, danger = false, className = "", ...props }) {
    const classes = [
        "dropdown__item",
        danger && "dropdown__item--danger",
        className,
    ]
        .filter(Boolean)
        .join(" ");
    if (props.portalModal) {
        return (_jsx(ModalPortal, { iconName: icon, label: label, className: classes, children: (onClose) => props.render(onClose) }));
    }
    return (_jsx(Button, { className: classes, disabled: disabled, role: "menuitem", label: label, icon: icon, ...props, children: props.children }));
}
