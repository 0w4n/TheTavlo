import type { ModalProps } from "./modal.types";
import { ModalHeader, ModalBody, ModalFooter } from "./components";
import "./modal.css";
/**
 * Modal component
 */
export declare function Modal({ onClose, closeOnBackdropClick, closeOnEscape, size, className, children, ...props }: ModalProps): import("react").JSX.Element;
export declare namespace Modal {
    var displayName: string;
    var Header: typeof ModalHeader;
    var Body: typeof ModalBody;
    var Footer: typeof ModalFooter;
}
