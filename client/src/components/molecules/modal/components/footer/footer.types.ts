import type { HTMLAttributes } from "react";

export interface ModalFooterProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Content of the footer
   */
  children: React.ReactNode;
}
