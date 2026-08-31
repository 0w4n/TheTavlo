import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Modal } from "#components/molecules/modal";
import { useState } from "react";
import usePanels from "#features/panels/presentation/hooks/usePanels";
import { Timestamp } from "firebase/firestore";
import { ReturnType } from "#features/panels/presentation/context/panelsContext.types";
import { Button } from "#components/atoms/button";
import "./addPanels.css";
export function AddPanels({ onClose }) {
    const now = Timestamp.now();
    const initPanel = {
        parentId: null,
        name: "",
        color: 0,
        icon: "",
        sharedWith: null,
        createdAt: now,
        updatedAt: now,
    };
    const [panel, setPanel] = useState(initPanel);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const { createPanel } = usePanels();
    async function handleCreatePanels(e) {
        e.preventDefault();
        try {
            setIsLoading(true);
            await createPanel(panel, {
                addToParent: true,
                return: ReturnType.DEFAULT,
            });
        }
        catch (error) {
            throw new Error(error instanceof Error
                ? error.message
                : "Error desconocido al crear el panel");
        }
        finally {
            setIsLoading(false);
            onClose();
        }
    }
    return (_jsxs(_Fragment, { children: [_jsx(Modal.Header, { onClose: onClose, title: "Nuevo panel" }), _jsx(Modal.Body, { children: _jsxs("form", { onSubmit: handleCreatePanels, method: "post", children: [_jsx(Field, { label: "Titulo", required: true, error: errors.title, children: _jsx("input", { type: "text", value: panel?.name, placeholder: "Titulo del panel", onChange: (e) => {
                                    setPanel((p) => ({ ...p, name: e.target.value }));
                                    setErrors((err) => ({ ...err, title: undefined }));
                                } }) }), _jsx(Field, { label: "Icono que lo representa", required: true, error: errors.icon, children: _jsx("input", { type: "text", value: panel?.icon, placeholder: "Icono que lo representa", onChange: (e) => {
                                    setPanel((p) => ({ ...p, icon: e.target.value }));
                                    setErrors((err) => ({ ...err, icon: undefined }));
                                } }) }), _jsxs(Field, { label: "Color", required: true, error: errors.color?.toString(), children: [_jsx("input", { type: "number", value: panel?.color, placeholder: "Color del panel (0-360)", min: 0, max: 360, step: 2, onChange: (e) => {
                                        setPanel((p) => ({ ...p, color: e.target.valueAsNumber }));
                                        setErrors((err) => ({ ...err, color: undefined }));
                                    } }), _jsx("div", { style: {
                                        backgroundColor: `hsl(${panel?.color}, 100%, 80%)`,
                                    }, children: _jsx("span", { style: { color: `hsl(${panel?.color}, 100%, 25%)` }, children: "AbC" }) })] })] }) }), _jsx(Modal.Footer, { children: _jsxs("div", { className: "add-panel__footer", children: [onClose && (_jsx(Button, { type: "button", onClick: onClose, label: "Cancelar", className: "add-panel__btn-ghost", disabled: isLoading })), _jsx(Button, { type: "button", className: "add-panel__btn-primary", label: isLoading ? "Creando..." : "Crear panel", disabled: isLoading, onClick: handleCreatePanels })] }) })] }));
}
// ─── Field ───────────────────────────────────────────────────────────────────
function Field({ label, required, error, hint, children, }) {
    return (_jsxs("div", { className: "field", children: [_jsxs("label", { className: "field__label", children: [label + "   ", required && (_jsx("span", { className: "field__required", "aria-hidden": "true", children: "*" }))] }), children, error && (_jsx("p", { className: "field__error", role: "alert", children: error })), hint && !error && _jsx("p", { className: "field__hint", children: hint })] }));
}
