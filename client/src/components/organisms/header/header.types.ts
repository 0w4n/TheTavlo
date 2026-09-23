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
export type HeaderDropDownIconAction = {
  type: "dropdown";
  options: DropdownItemProps[];
  iconTrigger: string;
};

export type HeaderDropDownChildrenAction = {
  type: "dropdown";
  options: DropdownItemProps[];
  childrenTrigger: ReactNode;
};

export type HeaderDropDownAction =
  | HeaderDropDownIconAction
  | HeaderDropDownChildrenAction;

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

export function isIconTrigger(
  header: HeaderDropDownAction,
): header is HeaderDropDownIconAction {
  return "iconTrigger" in header;
}

export function isChildrenTrigger(
  header: HeaderDropDownAction,
): header is HeaderDropDownChildrenAction {
  return "childrenTrigger" in header;
}
