import type { HTMLAttributes } from "react";

export interface ModalBodyProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Content of the body
   */
  children: React.ReactNode;
}
