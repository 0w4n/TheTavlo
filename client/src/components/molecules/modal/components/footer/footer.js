import { jsx as _jsx } from "react/jsx-runtime";
import "./footer.css";
export function ModalFooter({ children, className = "", ...props }) {
    return (_jsx("div", { className: `modal__footer ${className}`, ...props, children: children }));
}
