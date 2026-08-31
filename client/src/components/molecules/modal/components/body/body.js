import { jsx as _jsx } from "react/jsx-runtime";
import "./body.css";
export function ModalBody({ children, className = "", ...props }) {
    return (_jsx("div", { className: `modal__body ${className}`, ...props, children: children }));
}
