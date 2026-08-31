import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import React, {} from "react";
import "../../base/colors.css";
import Icon from "#shared/ui/atoms/icons";
import "./button.css";
export const Button = ({ variant = "primary", size = "md", icon, label, iconSize, iconColor, isLoading = false, className = "", disabled, children, ...props }) => {
    const classes = [
        "button",
        `button__${variant}`,
        `button__${size}`,
        isLoading && "button__loading",
        icon && "button__icon",
        className,
    ]
        .filter(Boolean)
        .join(" ");
    return (_jsxs("button", { className: classes, disabled: disabled || isLoading, ...props, children: [isLoading ? (_jsx("span", { className: "button__icon", children: "Cargando..." })) : icon && label ? (_jsxs(_Fragment, { children: [_jsx(Icon, { name: icon, color: iconColor, size: iconSize ?? 24 }), _jsx("span", { children: label })] })) : icon != undefined ? (_jsx(Icon, { name: icon, color: iconColor, size: iconSize ?? 24 })) : label ? (_jsx("span", { children: label })) : null, children] }));
};
