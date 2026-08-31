import React from "react";
import type { DropdownProps } from "./dropdown.types";
import { DropdownItem, DropdownDivider } from "./components";
import "./dropdown.css";
export declare function Dropdown({ trigger, position, disabled, children, className, ...props }: DropdownProps): React.JSX.Element;
export declare namespace Dropdown {
    var displayName: string;
    var Item: typeof DropdownItem;
    var Divider: typeof DropdownDivider;
}
