import type { DropdownItemProps } from "#components/molecules/dropdown";
import type { HTMLAttributes, ReactNode } from "react";

/* =====================
   ACTION TYPES
===================== */

export type HeaderAction =
  | HeaderButtonAction
  | HeaderDialogAction
  | HeaderDropDownAction
  | HeaderChildrenAction;

/* ---------- BUTTON ---------- */
export interface HeaderButtonAction {
  type: "button";
  icon: string;
  onClick: () => void;
  disabled?: boolean;
}

/* ---------- DIALOG ---------- */
export interface HeaderDialogAction {
  type: "dialog";
  icon: string;
  dialog: (onClose: () => void) => ReactNode;
  className?: string;
}

/* ---------- DROPDOWN ---------- */
export interface HeaderDropDownAction {
  type: "dropdown";
  iconTrigger?: string;
  options: DropdownItemProps[];
}

/* ---------- CHILDREN ---------- */
export interface HeaderChildrenAction {
  type: "children";
  children: ReactNode;
}

/* =====================
   HEADER PROPS
===================== */

export interface HeaderProps extends HTMLAttributes<HTMLElement> {
  logo?: ReactNode;
  logoText?: string;
  logoHref?: string;
  actions?: HeaderAction[];
  rightContent?: ReactNode;
  dateTimeItem?: ReactNode;
}
