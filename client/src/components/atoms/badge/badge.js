import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import "./badge.css";
import Icon from "#shared/ui/atoms/icons";
import { getIconWithTaskProgress } from "./utils";
/**
 * Badge component for status indicators, labels, and counts
 *
 * @example
 * ```tsx
 * <Badge variant="success">Activo</Badge>
 * <Badge variant="error" dot>Error</Badge>
 * <Badge variant="primary" icon={<CheckIcon />}>Verificado</Badge>
 * ```
 */
export const Badge = ({ variant, collapsed = false, className = "", }) => {
    const classes = [
        collapsed ? "badge badge__collapsed" : "badge",
        `badge__${variant}`,
        className,
    ]
        .filter(Boolean)
        .join(" ");
    if (collapsed) {
        return (_jsx("div", { className: classes, children: _jsx(Icon, { name: getIconWithTaskProgress(variant), size: 16, stroke: "2" }) }));
    }
    else {
        return (_jsxs("div", { className: classes, children: [_jsx(Icon, { name: getIconWithTaskProgress(variant), size: 16, stroke: "2" }), _jsx("span", { children: variant.toString() })] }));
    }
};
Badge.displayName = "Badge";
