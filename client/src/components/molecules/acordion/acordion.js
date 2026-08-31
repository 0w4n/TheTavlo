import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useId, useRef } from "react";
import { Button } from "#components/atoms/button";
import "./acordion.css";
function AccordionItemComponent({ item, isOpen, onToggle, panelId, triggerId, }) {
    const contentRef = useRef(null);
    return (_jsxs("div", { className: "item", children: [_jsx(Button, { variant: "ghost", label: item.title, icon: isOpen ? "IconChevronDown" : "IconChevronRight", id: triggerId, "aria-expanded": isOpen, "aria-controls": panelId, disabled: item.disabled, onClick: onToggle, "data-open": isOpen, className: "acordion__item-trigger" }), _jsx("div", { id: panelId, role: "region", "aria-labelledby": triggerId, "data-open": isOpen, className: "panel", children: _jsx("div", { ref: contentRef, className: "panelInner", children: _jsx("div", { className: "content", children: item.content }) }) })] }));
}
// ─── Accordion principal ──────────────────────────────────────────────────────
export function Accordion({ items, variant = "single", defaultOpen, className, }) {
    const uid = useId();
    const getInitialOpen = () => {
        if (!defaultOpen)
            return new Set();
        const ids = Array.isArray(defaultOpen) ? defaultOpen : [defaultOpen];
        return new Set(ids);
    };
    const [openItems, setOpenItems] = useState(getInitialOpen);
    const getItemId = (item, index) => item.id ?? `${uid}-item-${index}`;
    const toggle = (itemId) => {
        setOpenItems((prev) => {
            const next = new Set(prev);
            if (next.has(itemId)) {
                next.delete(itemId);
            }
            else {
                if (variant === "single")
                    next.clear();
                next.add(itemId);
            }
            return next;
        });
    };
    return (_jsx("div", { className: `accordion ${className ?? ""}`, children: items.map((item, index) => {
            const itemId = getItemId(item, index);
            const triggerId = `${itemId}-trigger`;
            const panelId = `${itemId}-panel`;
            const isOpen = openItems.has(itemId);
            return (_jsx(AccordionItemComponent, { item: item, isOpen: isOpen, onToggle: () => !item.disabled && toggle(itemId), panelId: panelId, triggerId: triggerId }, itemId));
        }) }));
}
