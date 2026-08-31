import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "#components/atoms/button";
import { Modal } from "../modal";
/**
 * Modal component for dialogs and overlays
 *
 * @example
 * ```tsx
 * <ModalPortal iconName="IconLayoutGridAdd">
 *   {children}
 * </ModalPortal>
 * ```
 */
export default function ModalPortal({ variant, disabled, iconName, label, className, children }) {
    const [open, setOpen] = useState(false);
    return (_jsxs(_Fragment, { children: [_jsx(Button, { variant: variant, onClick: () => setOpen(true), icon: iconName, label: label, disabled: disabled, className: className }), open &&
                createPortal(_jsx(Modal, { onClose: (open) => setOpen(open), size: "full", children: children(() => setOpen(false)) }), document.body)] }));
}
