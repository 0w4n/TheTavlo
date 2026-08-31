import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import "./emptystate.css";
/**
 * EmptyState component for displaying empty or zero states
 *
 * @example
 * ```tsx
 * <EmptyState
 *   icon={<GridIcon />}
 *   title="No hay widgets"
 *   description="Comienza agregando tu primer widget"
 *   action={<Button>Añadir widget</Button>}
 * />
 * ```
 */
export const EmptyState = ({ icon, title, description, action, secondaryAction, size = "md", className = "", ...props }) => {
    const classes = ["empty-state", `empty-state--${size}`, className]
        .filter(Boolean)
        .join(" ");
    return (_jsxs("div", { className: classes, ...props, children: [icon && (_jsx("div", { className: "empty-state__icon", "aria-hidden": "true", children: icon })), _jsx("h2", { className: "empty-state__title", children: title }), description && _jsx("p", { className: "empty-state__description", children: description }), (action || secondaryAction) && (_jsxs("div", { className: "empty-state__actions", children: [secondaryAction, action] }))] }));
};
EmptyState.displayName = "EmptyState";
