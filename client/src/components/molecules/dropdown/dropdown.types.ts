import type { HTMLAttributes } from "react";

export type DropdownPosition =
  | "bottom-start"
  | "bottom-end"
  | "top-start"
  | "top-end";

export interface DropdownProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Trigger element that opens the dropdown
   */
  trigger: React.ReactNode;

  /**
   * Position of the dropdown relative to trigger
   * @default 'bottom-start'
   */
  position?: DropdownPosition;

  /**
   * Whether the dropdown is disabled
   */
  disabled?: boolean;

  /**
   * Content of the dropdown
   */
  children: React.ReactNode;
}
