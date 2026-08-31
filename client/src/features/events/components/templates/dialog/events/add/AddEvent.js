import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Button } from "#components/atoms/button";
import { ModalBody, ModalFooter, ModalHeader, } from "#components/molecules/modal";
import { useState } from "react";
export default function AddEvent({ type }) {
    const [_event, _setEvent] = useState();
    return (_jsxs(_Fragment, { children: [_jsx(ModalHeader, { onClose: () => { }, title: `Agregar ${type}` }), _jsx(ModalBody, { children: _jsx("div", { children: _jsx("p", { children: "Poner Evento" }) }) }), _jsxs(ModalFooter, { children: [_jsx(Button, { variant: "secondary", title: "Cancelar", icon: "IconX", onClick: () => { } }), _jsx(Button, { variant: "primary", title: "Guardar", icon: "IconSave", onClick: () => { } })] })] }));
}
