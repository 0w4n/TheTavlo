import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useState, useEffect } from "react";
import "./datetimebadge.css";
import { Button } from "../button";
/**
 * DateTimeBadge component - muestra fecha y hora actual.
 * Al hacer click, abre el componente Rise
 *
 * @example
 * ```tsx
 * <DateTimeBadge
 *   variant="detailed"
 *   showLiveTime
 *   eventCount={3}
 * />
 * ```
 */
export const DateTimeBadge = ({ date: initialDate, variant = "default", showLiveTime = true, showSeconds = false, interactive = true, eventCount, className = "", onClick, ...props }) => {
    const [currentDate, setCurrentDate] = useState(initialDate || new Date());
    // Update time every second if showLiveTime is true
    useEffect(() => {
        if (!showLiveTime)
            return;
        const interval = setInterval(() => {
            setCurrentDate(new Date());
        }, showSeconds ? 500 : 15000);
        return () => clearInterval(interval);
    }, [showLiveTime, showSeconds]);
    // Format functions
    const formatDate = (date) => {
        return date.toLocaleDateString("es-ES", {
            weekday: "short",
            day: "2-digit"
        });
    };
    const formatTime = (date) => {
        const options = {
            hour: "2-digit",
            minute: "2-digit",
            ...(showSeconds && { second: "2-digit" }),
        };
        return date.toLocaleTimeString("es-ES", options);
    };
    const classes = [
        "datetime-badge",
        `datetime-badge--${variant}`,
        interactive && "datetime-badge--interactive",
        className,
    ]
        .filter(Boolean)
        .join(" ");
    return (_jsx(_Fragment, { children: _jsx(Button, { className: classes, onClick: onClick, variant: "primary", ...props, children: _jsxs("div", { className: "datetime-badge__content", children: [_jsx("span", { className: "datetime-badge__date", children: formatDate(currentDate) }), _jsx("span", { className: "datetime-badge__time", children: formatTime(currentDate) })] }) }) }));
};
DateTimeBadge.displayName = "DateTimeBadge";
