import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useRef, useEffect } from "react";
import "./tooltip.css";
/**
 * Tooltip component for contextual information
 *
 * @example
 * ```tsx
 * <Tooltip content="Este es un tooltip informativo" position="top">
 *   <Button>Hover me</Button>
 * </Tooltip>
 *
 * <Tooltip content="Ayuda adicional" position="right" delay={300}>
 *   <Icon name="help" />
 * </Tooltip>
 * ```
 */
export const Tooltip = ({ content, position = "top", delay = 500, disabled = false, children, className = "", ...props }) => {
    const [isVisible, setIsVisible] = useState(false);
    const timeoutRef = useRef(null);
    const tooltipId = useRef(`tooltip-${Math.random().toString(36)}`);
    // Show tooltip con delay
    const handleMouseEnter = () => {
        if (disabled)
            return;
        timeoutRef.current = setTimeout(() => {
            setIsVisible(true);
        }, delay);
    };
    // Hide tooltip
    const handleMouseLeave = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        setIsVisible(false);
    };
    // Show tooltip on focus
    const handleFocus = () => {
        if (disabled)
            return;
        setIsVisible(true);
    };
    // Hide tooltip on blur
    const handleBlur = () => {
        setIsVisible(false);
    };
    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);
    const containerClasses = ["tooltip", className].filter(Boolean).join(" ");
    return (_jsxs("div", { className: containerClasses, ...props, children: [_jsx("div", { className: "tooltip__trigger", onMouseEnter: handleMouseEnter, onMouseLeave: handleMouseLeave, onFocus: handleFocus, onBlur: handleBlur, "aria-describedby": isVisible ? tooltipId.current : undefined, children: children }), isVisible && !disabled && (_jsxs("div", { id: tooltipId.current, className: `tooltip__content tooltip__content--${position}`, role: "tooltip", children: [content, _jsx("div", { className: "tooltip__arrow" })] }))] }));
};
Tooltip.displayName = "Tooltip";
