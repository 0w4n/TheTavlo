import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useRef } from "react";
import { ModalHeader, ModalBody, ModalFooter } from "./components";
import "./modal.css";
/**
 * Modal component
 */
export function Modal({ onClose, closeOnBackdropClick = true, closeOnEscape = true, size = "md", className = "", children, ...props }) {
    const modalRef = useRef(null);
    const previousActiveElement = useRef(null);
    // ESC
    useEffect(() => {
        if (!closeOnEscape)
            return;
        const onEsc = (e) => {
            if (e.key === "Escape") {
                onClose(false);
            }
        };
        document.addEventListener("keydown", onEsc);
        return () => document.removeEventListener("keydown", onEsc);
    }, [closeOnEscape, onClose]);
    // Scroll lock + restore focus
    useEffect(() => {
        previousActiveElement.current = document.activeElement;
        document.body.classList.add("modal-open");
        return () => {
            document.body.classList.remove("modal-open");
            previousActiveElement.current?.focus();
        };
    }, []);
    // Focus trap
    useEffect(() => {
        if (!modalRef.current)
            return;
        const modal = modalRef.current;
        const focusable = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusable.length === 0)
            return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        first?.focus();
        const onTab = (e) => {
            if (e.key !== "Tab")
                return;
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last?.focus();
            }
            else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first?.focus();
            }
        };
        modal.addEventListener("keydown", onTab);
        return () => modal.removeEventListener("keydown", onTab);
    }, []);
    return (_jsx("div", { className: "modal-overlay", role: "dialog", "data-modal-portal": true, "aria-modal": "true", "aria-labelledby": "modal-title", onClick: (e) => {
            e.stopPropagation();
            if (!closeOnBackdropClick)
                return;
            if (modalRef.current && !modalRef.current.contains(e.target)) {
                onClose(false);
            }
        }, children: _jsx("div", { ref: modalRef, className: `modal__container modal__${size} ${className}`, onClick: (e) => e.stopPropagation(), ...props, children: children }) }));
}
Modal.displayName = "Modal";
Modal.Header = ModalHeader;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;
