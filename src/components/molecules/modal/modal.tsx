import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type {
  ModalProps,
  ModalHeaderProps,
  ModalBodyProps,
  ModalFooterProps,
} from "./modal.types";
import "./modal.css";

const CloseIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M15 5L5 15M5 5l10 10"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * Modal component for dialogs and overlays
 *
 * @example
 * ```tsx
 * <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} size="md">
 *   <Modal.Header>
 *     <h2>Título del Modal</h2>
 *   </Modal.Header>
 *   <Modal.Body>
 *     Contenido del modal
 *   </Modal.Body>
 *   <Modal.Footer>
 *     <Button onClick={onClose}>Cancelar</Button>
 *     <Button variant="primary">Aceptar</Button>
 *   </Modal.Footer>
 * </Modal>
 * ```
 */
export const Modal: React.FC<ModalProps> & {
  Header: React.FC<ModalHeaderProps>;
  Body: React.FC<ModalBodyProps>;
  Footer: React.FC<ModalFooterProps>;
} = ({
  isOpen,
  onClose,
  size = "md",
  closeOnBackdropClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  children,
  className = "",
  ...props
}) => {
  const [isClosing, setIsClosing] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Manejar el cierre con animación
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300); // Duración de la animación
  };

  // Click en el backdrop
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      handleClose();
    }
  };

  // Tecla ESC
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, closeOnEscape]);

  // Prevenir scroll del body
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      document.body.classList.add("modal-open");

      return () => {
        document.body.classList.remove("modal-open");
        // Restaurar foco al elemento anterior
        if (previousActiveElement.current) {
          previousActiveElement.current.focus();
        }
      };
    }
  }, [isOpen]);

  // Focus trap
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    const modal = modalRef.current;
    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[
      focusableElements.length - 1
    ] as HTMLElement;

    // Focus en el primer elemento
    firstElement?.focus();

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    modal.addEventListener("keydown", handleTab);
    return () => modal.removeEventListener("keydown", handleTab);
  }, [isOpen]);

  if (!isOpen && !isClosing) return null;

  const backdropClasses = [
    "modal-backdrop",
    isClosing && "modal-backdrop--closing",
  ]
    .filter(Boolean)
    .join(" ");

  const containerClasses = ["modal-container", `modal--${size}`, className]
    .filter(Boolean)
    .join(" ");

  return createPortal(
    <div
      className={backdropClasses}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div ref={modalRef} className={containerClasses} {...props}>
        {/* Close Button */}
        {showCloseButton && (
          <button
            className="modal__close-button"
            onClick={handleClose}
            aria-label="Cerrar modal"
            type="button"
          >
            <CloseIcon />
          </button>
        )}

        {/* Content */}
        {children}
      </div>
    </div>,
    document.body
  );
};

/**
 * Modal Header subcomponent
 */
const ModalHeader: React.FC<ModalHeaderProps> = ({
  children,
  className = "",
  ...props
}) => {
  return (
    <div className={`modal__header ${className}`} {...props}>
      {children}
    </div>
  );
};

/**
 * Modal Body subcomponent
 */
const ModalBody: React.FC<ModalBodyProps> = ({
  children,
  className = "",
  ...props
}) => {
  return (
    <div className={`modal__body ${className}`} {...props}>
      {children}
    </div>
  );
};

/**
 * Modal Footer subcomponent
 */
const ModalFooter: React.FC<ModalFooterProps> = ({
  children,
  className = "",
  ...props
}) => {
  return (
    <div className={`modal__footer ${className}`} {...props}>
      {children}
    </div>
  );
};

// Attach subcomponents
Modal.Header = ModalHeader;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;

Modal.displayName = "Modal";
ModalHeader.displayName = "Modal.Header";
ModalBody.displayName = "Modal.Body";
ModalFooter.displayName = "Modal.Footer";
