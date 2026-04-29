import type { HTMLAttributes } from "react";

export interface ModalHeaderProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Content of the header
   */
  children: React.ReactNode;
  onClose: (open: boolean) => void;
  icon?: string;
}