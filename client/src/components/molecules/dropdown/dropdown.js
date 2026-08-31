import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useRef, useEffect } from "react";
import { DropdownItem, DropdownDivider } from "./components";
import "./dropdown.css";
/** Type guard para detectar Dropdown.Item */
function isDropdownItem(element) {
    return element.type === DropdownItem;
}
export function Dropdown({ trigger, position = "bottom-start", disabled = false, children, className = "", ...props }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const triggerRef = useRef(null);
    function handleToggle(e) {
        if (!disabled)
            setIsOpen(!isOpen);
        e.stopPropagation();
    }
    function handleClose(e) {
        e.stopPropagation();
        setIsOpen(false);
    }
    useEffect(() => {
        if (!isOpen)
            return;
        function handleClickOutside(e) {
            // Si el click fue dentro de un modal portal, no cerrar
            const isInsidePortal = document.querySelector('[data-modal-portal]')
                ?.contains(e.target);
            if (isInsidePortal)
                return;
            if (dropdownRef.current &&
                !dropdownRef.current.contains(e.target)) {
                handleClose(e);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);
    useEffect(() => {
        if (!isOpen)
            return;
        function handleKeyDown(e) {
            if (e.key === "Escape") {
                handleClose(e);
                triggerRef.current?.focus();
            }
            if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                e.preventDefault();
                const items = dropdownRef.current?.querySelectorAll(".dropdown__item:not(:disabled)");
                if (!items?.length)
                    return;
                const currentIndex = Array.from(items).indexOf(document.activeElement);
                let nextIndex = e.key === "ArrowDown" ? currentIndex + 1 : currentIndex - 1;
                if (nextIndex < 0)
                    nextIndex = items.length - 1;
                if (nextIndex >= items.length)
                    nextIndex = 0;
                items[nextIndex].focus();
            }
        }
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isOpen]);
    const containerClasses = [
        "dropdown",
        disabled && "dropdown--disabled",
        className,
    ]
        .filter(Boolean)
        .join(" ");
    return (_jsxs("div", { ref: dropdownRef, className: containerClasses, ...props, children: [_jsx("div", { ref: triggerRef, className: "dropdown__trigger", onClick: (e) => handleToggle(e), role: "button", "aria-haspopup": "true", "aria-expanded": isOpen, tabIndex: disabled ? -1 : 0, onKeyDown: (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        e.stopPropagation();
                        handleToggle(e);
                    }
                }, children: trigger }), isOpen && (_jsxs(_Fragment, { children: [_jsx("div", { className: "dropdown__backdrop", onClick: handleClose }), _jsx("div", { className: `dropdown__menu dropdown__menu--${position}`, role: "menu", "aria-orientation": "vertical", children: React.Children.map(children, (child) => {
                            if (React.isValidElement(child)) {
                                if (isDropdownItem(child)) {
                                    return React.cloneElement(child, {
                                        onClick: (e) => {
                                            child.props.portalModal === false && child.props.onClick?.(e);
                                            e.stopPropagation();
                                            handleClose(e);
                                        }
                                    });
                                }
                                return child;
                            }
                            return child;
                        }) })] }))] }));
}
Dropdown.displayName = "Dropdown";
Dropdown.Item = DropdownItem;
Dropdown.Divider = DropdownDivider;
