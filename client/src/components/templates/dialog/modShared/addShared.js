import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { Modal } from "#components/molecules/modal";
import { Button } from "#components/atoms/button";
import { Input } from "#components/atoms/input/input";
import { useState } from "react";
import useGlobalContext from "#core/globalContext/hooks/useGlobalContext";
import { resolvePanelOwner } from "#core/globalContext/resolvePanelOwner";
import usePanels from "#features/panels/presentation/hooks/usePanels";
import { InvitationApiClient, UserRole, } from "#features/invitations/infraestructure/invitationApiClient";
import "./addShared.css";
export default function AddShared({ type, onClose }) {
    const ctx = useGlobalContext();
    const { state: panelsState } = usePanels();
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState({ kind: "idle" });
    const isPublicLink = type === "public";
    const panelId = ctx.state.panel.panelId;
    const { ownerId, accountType: ownerAccountType } = resolvePanelOwner(ctx);
    const panelName = panelsState.status === "panel"
        ? panelsState.currentPanel.name || "este panel"
        : "este panel";
    const handleSubmit = async () => {
        if (status.kind === "loading")
            return;
        if (isPublicLink) {
            setStatus({ kind: "loading" });
            try {
                const { url } = await InvitationApiClient.createPublicLink({
                    panelId,
                    ownerId,
                    ownerAccountType,
                });
                setStatus({ kind: "link", url });
            }
            catch (error) {
                setStatus({
                    kind: "error",
                    message: error instanceof Error
                        ? error.message
                        : "No se pudo generar el enlace.",
                });
            }
            return;
        }
        if (!email.trim()) {
            setStatus({ kind: "error", message: "Ingresa un correo electrónico." });
            return;
        }
        setStatus({ kind: "loading" });
        try {
            await InvitationApiClient.inviteByEmail({
                panelId,
                panelName,
                ownerId,
                ownerAccountType,
                email: email.trim(),
                role: UserRole.VIEWER,
            });
            setStatus({ kind: "sent" });
        }
        catch (error) {
            setStatus({
                kind: "error",
                message: error instanceof Error
                    ? error.message
                    : "No se pudo enviar la invitación.",
            });
        }
    };
    const handleCopyLink = (url) => {
        navigator.clipboard?.writeText(url);
    };
    const isBusy = status.kind === "loading";
    const isDone = status.kind === "sent" || status.kind === "link";
    return (_jsxs(_Fragment, { children: [_jsx(Modal.Header, { onClose: onClose, icon: "IconShare", title: isPublicLink ? "Compartir públicamente" : "Compartir con usuario" }), _jsx(Modal.Body, { children: _jsxs("div", { className: "add-shared__form", children: [isPublicLink ? (status.kind === "link" ? (_jsxs(_Fragment, { children: [_jsx(Input, { variant: "default", label: "Enlace", leftIcon: "IconLink", value: status.url, readOnly: true }), _jsx(Button, { onClick: () => handleCopyLink(status.url), variant: "secondary", label: "Copiar enlace" })] })) : (_jsx("p", { children: "Cualquier persona con el enlace va a poder ver este panel (sin poder editarlo)." }))) : status.kind === "sent" ? (_jsxs("p", { children: ["Invitaci\u00F3n enviada a ", email, "."] })) : (_jsxs(_Fragment, { children: [_jsx(Input, { variant: "default", label: "Correo electr\u00F3nico", placeholder: "Ingrese el correo electr\u00F3nico", leftIcon: "IconAt", value: email, onChange: (e) => setEmail(e.target.value) }), _jsx("p", { className: "add-shared__hint", children: "Va a poder ver este panel. Si ya tiene cuenta en TheTavlo le aparece de inmediato; si no, le mandamos un correo para que se una." })] })), status.kind === "error" && (_jsx("p", { className: "add-shared__error", children: status.message }))] }) }), _jsxs(Modal.Footer, { children: [_jsx(Button, { onClick: onClose, variant: "ghost", label: "Cancelar" }), !isDone && (_jsx(Button, { onClick: handleSubmit, variant: "primary", disabled: isBusy, label: isBusy ? "Enviando..." : isPublicLink ? "Generar enlace" : "Invitar" }))] })] }));
}
