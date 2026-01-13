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

export interface DropdownItemProps extends HTMLAttributes<Element> {
  /**
   * Icon to display before the text
   */
  icon?: React.ReactNode;

  /**
   * Whether the item is disabled
   */
  disabled?: boolean;

  /**
   * Whether the item represents a dangerous action
   */
  danger?: boolean;

  /**
   * Content of the item
   */
  children: React.ReactNode;
}

export interface DropdownDividerProps {
  /**
   * Optional label for the divider
   */
  label?: string;
}
