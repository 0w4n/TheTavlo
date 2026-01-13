import type { HTMLAttributes} from "react";


export type ModalSize = "sm" | "md" | "lg" | "xl" | "full";

export interface ModalProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onClose"> {
  /**
   * Whether the modal is open
   */
  isOpen: boolean;

  /**
   * Callback when modal should close
   */
  onClose: () => void;

  /**
   * Size of the modal
   * @default 'md'
   */
  size?: ModalSize;

  /**
   * Whether clicking the backdrop closes the modal
   * @default true
   */
  closeOnBackdropClick?: boolean;

  /**
   * Whether pressing ESC closes the modal
   * @default true
   */
  closeOnEscape?: boolean;

  /**
   * Whether to show the close button
   * @default true
   */
  showCloseButton?: boolean;

  /**
   * Content of the modal
   */
  children: React.ReactNode;
}

export interface ModalHeaderProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Content of the header
   */
  children: React.ReactNode;
}

export interface ModalBodyProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Content of the body
   */
  children: React.ReactNode;
}

export interface ModalFooterProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Content of the footer
   */
  children: React.ReactNode;
}

export interface ModalPortalProps {
  className?: string;

  iconName: string;

  children: (onClose: () => void) => React.ReactNode;
}