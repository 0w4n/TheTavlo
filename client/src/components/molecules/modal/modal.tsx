import { useEffect, useRef } from "react";
import type { ModalProps } from "./modal.types";
import { ModalHeader, ModalBody, ModalFooter } from "./components";

import "./modal.css";

/**
 * Modal component
 */
export function Modal({
  onClose,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  size = "md",
  className = "",
  children,
  ...props
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // ESC
  useEffect(() => {
    if (!closeOnEscape) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose(false);
      }
    };
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [closeOnEscape, onClose]);

  // Scroll lock + restore focus
  useEffect(() => {
    previousActiveElement.current = document.activeElement as HTMLElement;
    document.body.classList.add("modal-open");
    return () => {
      document.body.classList.remove("modal-open");
      previousActiveElement.current?.focus();
    };
  }, []);

  // Focus trap
  useEffect(() => {
    if (!modalRef.current) return;
    const modal = modalRef.current;

    const focusable = modal.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );

    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    first?.focus();

    const onTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };

    modal.addEventListener("keydown", onTab);
    return () => modal.removeEventListener("keydown", onTab);
  }, []);

  return (
    <div
      className="modal-overlay"
      role="dialog"
      data-modal-portal
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={(e) => {
        e.stopPropagation();
        if (!closeOnBackdropClick) return;

        if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
          onClose(false);
        }
      }}
    >
      <div
        ref={modalRef}
        className={`modal__container modal__${size} ${className}`}
        onClick={(e) => e.stopPropagation()}
        {...props}
      >
        {children}
      </div>
    </div>
  );
}

Modal.displayName = "Modal";

Modal.Header = ModalHeader;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;
