import type { HTMLAttributes} from "react";

export type ModalSize = "sm" | "md" | "lg" | "xl" | "full";

export interface ModalProps extends Omit<HTMLAttributes<HTMLDivElement>, "onClose"> {
  /**
   * Callback when modal should close
   */
  onClose: (open: boolean) => void;

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
   * Content of the modal
   */
  children: React.ReactNode;
}
