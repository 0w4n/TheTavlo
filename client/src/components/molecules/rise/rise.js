import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useEffect } from "react";
import "./rise.css";
import Icon from "#shared/ui/atoms/icons";
import { Button } from "#components/atoms/button";
/**
 * RiseItem - Individual item component
 */
const RiseItem = ({ item, onClick, onStatusChange, }) => {
    const handleCheckboxClick = (e) => {
        e.stopPropagation();
        if (onStatusChange) {
            const newStatus = item.status === "completed" ? "pending" : "completed";
            onStatusChange(item.id, newStatus);
        }
    };
    const handleClick = () => {
        if (onClick) {
            onClick(item);
        }
    };
    return (_jsx("div", { className: "rise-item", onClick: handleClick, children: _jsxs("div", { className: "rise-item__header", children: [(item.type === "task" || item.type === "deadline") && (_jsx("div", { className: "rise-item__checkbox", onClick: handleCheckboxClick, role: "checkbox", "aria-checked": item.status === "completed" })), _jsxs("div", { className: "rise-item__content", children: [_jsx("h4", { className: "rise-item__title", children: item.title }), item.description && (_jsx("p", { className: "rise-item__description", children: item.description })), _jsxs("div", { className: "rise-item__meta", children: [item.time && (_jsxs("div", { className: "rise-item__meta-item", children: [_jsx(Icon, { name: "Clock" }), _jsx("span", { children: item.time })] })), item.duration && (_jsx("div", { className: "rise-item__meta-item", children: _jsxs("span", { children: ["\u2022 ", item.duration] }) })), item.location && (_jsxs("div", { className: "rise-item__meta-item", children: [_jsx(Icon, { name: "MapPinIcon" }), _jsx("span", { children: item.location })] })), item.attendees && item.attendees.length > 0 && (_jsxs("div", { className: "rise-item__meta-item", children: [_jsx(Icon, { name: "IconUser" }), _jsxs("span", { children: [item.attendees.length, " asistentes"] })] }))] })] }), item.priority && (_jsx("div", { className: `rise-item__priority rise-item__priority--${item.priority}`, children: item.priority }))] }) }));
};
/**
 * RiseSection - Section component
 */
const RiseSection = ({ section, onItemClick, onItemStatusChange, showCompleted = true, }) => {
    const filteredItems = showCompleted
        ? section.items
        : section.items.filter((item) => item.status !== "completed");
    if (filteredItems.length === 0 && !showCompleted) {
        return null;
    }
    return (_jsxs("section", { className: "rise-section", children: [_jsxs("div", { className: "rise-section__header", children: [section.icon && (_jsx("div", { className: "rise-section__icon", style: { color: section.color }, children: _jsx(Icon, { name: section.icon }) })), _jsx("h3", { className: "rise-section__title", children: section.title }), _jsx("span", { className: "rise-section__count", children: filteredItems.length })] }), _jsx("div", { className: "rise-section__items", children: filteredItems.length > 0 ? (filteredItems.map((item) => (_jsx(RiseItem, { item: item, onClick: onItemClick, onStatusChange: onItemStatusChange }, item.id)))) : (_jsx("div", { className: "rise-section__empty", children: "No hay elementos en esta secci\u00F3n" })) })] }));
};
/**
 * Rise - Main component
 */
export const Rise = ({ onClose, date = new Date(), sections, onItemClick, onItemStatusChange, showCompleted = true, headerContent, className = "", ...props }) => {
    const formatDate = (date) => date.toLocaleDateString("es-ES", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });
    const hasContent = sections.some((section) => section.items.length > 0);
    const b3 = date.getHours() < 14 ? "Buenos días" : date.getHours() < 18 ? "Buenas tardes" : "Buenas noches";
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === "Escape") {
                onClose();
            }
        };
        document.addEventListener("keydown", handleEscape);
        return () => {
            document.removeEventListener("keydown", handleEscape);
        };
    }, [onClose]);
    return (_jsxs("div", { className: `rise-page ${className}`, ...props, children: [_jsx("section", { className: "rise__header-section", children: _jsx("header", { className: "rise__header", children: _jsx("div", { className: "rise__header-top", children: _jsx("div", { className: "rise__title-container", children: _jsxs("div", { children: [_jsxs("span", { children: [b3, ", Jorge"] }), _jsxs("p", { className: "rise__subtitle", children: ["Hoy es ", formatDate(date)] })] }) }) }) }) }), _jsx("main", { className: "rise__content", children: hasContent ? (sections.map((section, index) => (_jsx(RiseSection, { section: section, onItemClick: onItemClick, onItemStatusChange: onItemStatusChange, showCompleted: showCompleted }, index)))) : (_jsxs("div", { className: "rise__no-data", children: [_jsx(Icon, { name: "IconCalendar" }), _jsx("h2", { children: "No hay eventos para hoy" }), _jsx("p", { children: "Disfruta tu d\u00EDa o a\u00F1ade nuevas tareas" }), _jsx(Button, { variant: "primary", className: "rise__close-btn", onClick: onClose, "aria-label": "Cerrar Rise", children: _jsx(Icon, { name: "IconArrowLeft" }) })] })) })] }));
};
Rise.displayName = "Rise";
