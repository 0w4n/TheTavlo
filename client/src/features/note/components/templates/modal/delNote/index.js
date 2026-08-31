import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Button } from "#components/atoms/button";
import { ModalHeader, ModalFooter } from "#components/molecules/modal";
import { useNotes } from "#features/note/presentation/hooks/useNotes";
export default function DelNote({ id, onClose }) {
    const { deleteNote } = useNotes();
    return (_jsxs(_Fragment, { children: [_jsx(ModalHeader, { title: "Eliminar Nota", onClose: onClose }), _jsxs(ModalFooter, { children: [_jsx(Button, { variant: "secondary", title: "Cancelar", icon: "IconX", onClick: () => onClose(false) }), _jsx(Button, { variant: "danger", title: "Eliminar Nota", icon: "IconTrash", onClick: () => deleteNote(id) })] })] }));
}
