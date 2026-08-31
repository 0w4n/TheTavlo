import type { DropdownItemProps } from "#components/molecules/dropdown";
import type { HTMLAttributes, ReactNode } from "react";
export type HeaderAction = HeaderButtonAction | HeaderDialogAction | HeaderDropDownAction | HeaderChildrenAction;
export interface HeaderButtonAction {
    type: "button";
    icon: string;
    onClick: () => void;
    disabled?: boolean;
}
export interface HeaderDialogAction {
    type: "dialog";
    icon: string;
    dialog: (onClose: () => void) => ReactNode;
    className?: string;
}
export interface HeaderDropDownAction {
    type: "dropdown";
    iconTrigger?: string;
    options: DropdownItemProps[];
}
export interface HeaderChildrenAction {
    type: "children";
    children: ReactNode;
}
export interface HeaderProps extends HTMLAttributes<HTMLElement> {
    logo?: ReactNode;
    logoText?: string;
    logoHref?: string;
    actions?: HeaderAction[];
    rightContent?: ReactNode;
    dateTimeItem?: ReactNode;
}
