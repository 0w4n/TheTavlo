import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useEffect, useRef } from "react";
import "./rise.css";
import Icon from "#shared/ui/atoms/icons";
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
    const itemClasses = [
        "rise-item",
        item.status === "completed" && "rise-item--completed",
        item.status === "overdue" && "rise-item--overdue",
    ]
        .filter(Boolean)
        .join(" ");
    return (_jsx("div", { className: itemClasses, onClick: handleClick, children: _jsxs("div", { className: "rise-item__header", children: [(item.type === "task" || item.type === "deadline") && (_jsx("div", { className: "rise-item__checkbox", onClick: handleCheckboxClick, role: "checkbox", "aria-checked": item.status === "completed" })), _jsxs("div", { className: "rise-item__content", children: [_jsx("h4", { className: "rise-item__title", children: item.title }), item.description && (_jsx("p", { className: "rise-item__description", children: item.description })), _jsxs("div", { className: "rise-item__meta", children: [item.time && (_jsxs("div", { className: "rise-item__meta-item", children: [_jsx(Icon, { name: "IconClock" }), _jsx("span", { children: item.time })] })), item.duration && (_jsx("div", { className: "rise-item__meta-item", children: _jsxs("span", { children: ["\u2022 ", item.duration] }) })), item.location && (_jsxs("div", { className: "rise-item__meta-item", children: [_jsx(Icon, { name: "MapPinIcon" }), _jsx("span", { children: item.location })] })), item.attendees && item.attendees.length > 0 && (_jsxs("div", { className: "rise-item__meta-item", children: [_jsx(Icon, { name: "IconUser" }), _jsxs("span", { children: [item.attendees.length, " asistentes"] })] }))] })] }), item.priority && (_jsx("div", { className: `rise-item__priority rise-item__priority--${item.priority}`, children: item.priority }))] }) }));
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
    return (_jsxs("section", { className: "rise-section", children: [_jsxs("div", { className: "rise-section__header", children: [section.icon && (_jsx("div", { className: "rise-section__icon", style: { color: section.color }, children: section.icon })), _jsx("h3", { className: "rise-section__title", children: section.title }), _jsx("span", { className: "rise-section__count", children: filteredItems.length })] }), _jsx("div", { className: "rise-section__items", children: filteredItems.length > 0 ? (filteredItems.map((item) => (_jsx(RiseItem, { item: item, onClick: onItemClick, onStatusChange: onItemStatusChange }, item.id)))) : (_jsx("div", { className: "rise-section__empty", children: "No hay elementos en esta secci\u00F3n" })) })] }));
};
/**
 * Rise - Main component
 */
export const Rise = ({ isOpen, onClose, date = new Date(), sections, onItemClick, onItemStatusChange, showCompleted = true, headerContent, className = "", ...props }) => {
    const overlayRef = useRef(null);
    const previousActiveElement = useRef(null);
    // Close on ESC
    useEffect(() => {
        if (!isOpen)
            return;
        const handleEscape = (e) => {
            if (e.key === "Escape") {
                onClose();
            }
        };
        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [isOpen, onClose]);
    // Body scroll lock and focus management
    useEffect(() => {
        if (isOpen) {
            previousActiveElement.current = document.activeElement;
            document.body.style.overflow = "hidden";
            return () => {
                document.body.style.overflow = "";
                if (previousActiveElement.current) {
                    previousActiveElement.current.focus();
                }
            };
        }
    }, [isOpen]);
    // Click outside to close
    const handleOverlayClick = (e) => {
        if (e.target === overlayRef.current) {
            onClose();
        }
    };
    if (!isOpen)
        return null;
    // Calculate stats
    const totalItems = sections.reduce((sum, section) => sum + section.items.length, 0);
    const completedItems = sections.reduce((sum, section) => sum + section.items.filter((item) => item.status === "completed").length, 0);
    const pendingItems = totalItems - completedItems;
    // Format date
    const formatDate = (date) => {
        return date.toLocaleDateString("es-ES", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };
    const hasContent = sections.some((section) => section.items.length > 0);
    return (_jsx("div", { ref: overlayRef, className: "rise-overlay", onClick: handleOverlayClick, role: "dialog", "aria-modal": "true", "aria-labelledby": "rise-title", children: _jsxs("div", { className: `rise ${className}`, ...props, children: [_jsxs("header", { className: "rise__header", children: [_jsxs("div", { className: "rise__header-top", children: [_jsxs("div", { className: "rise__title-container", children: [_jsx("div", { className: "rise__icon", children: _jsx(Icon, { name: "IconSunrise" }) }), _jsxs("div", { children: [_jsx("h1", { id: "rise-title", className: "rise__title", children: "Rise" }), _jsx("p", { className: "rise__subtitle", children: formatDate(date) })] })] }), _jsx("button", { className: "rise__close-btn", onClick: onClose, "aria-label": "Cerrar Rise", type: "button", children: _jsx(Icon, { name: "IconX" }) })] }), _jsxs("div", { className: "rise__stats", children: [_jsxs("div", { className: "rise__stat", children: [_jsx("span", { className: "rise__stat-value", children: totalItems }), _jsx("span", { className: "rise__stat-label", children: "Total" })] }), _jsxs("div", { className: "rise__stat", children: [_jsx("span", { className: "rise__stat-value", children: pendingItems }), _jsx("span", { className: "rise__stat-label", children: "Pendientes" })] }), _jsxs("div", { className: "rise__stat", children: [_jsx("span", { className: "rise__stat-value", children: completedItems }), _jsx("span", { className: "rise__stat-label", children: "Completados" })] })] }), headerContent] }), _jsx("div", { className: "rise__content", children: hasContent ? (sections.map((section, index) => (_jsx(RiseSection, { section: section, onItemClick: onItemClick, onItemStatusChange: onItemStatusChange, showCompleted: showCompleted }, index)))) : (_jsxs("div", { className: "rise__no-data", children: [_jsx(Icon, { name: "IconCalendar" }), _jsx("h2", { className: "rise__no-data-title", children: "No hay eventos para hoy" }), _jsx("p", { className: "rise__no-data-description", children: "Disfruta de tu d\u00EDa libre o a\u00F1ade nuevas tareas" })] })) })] }) }));
};
Rise.displayName = "Rise";
