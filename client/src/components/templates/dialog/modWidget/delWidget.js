import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Modal } from "#components/molecules/modal";
import { Button } from "#components/atoms/button";
export function DelWidget({ onClose, onDelete }) {
    return (_jsxs(_Fragment, { children: [_jsx(Modal.Header, { onClose: onClose, title: "\u00BFQuieres eliminar este widget?" }), _jsxs(Modal.Footer, { children: [_jsx(Button, { label: "No, cancelar" }), _jsx(Button, { label: "Si, eliminar", onClick: onDelete })] })] }));
}
