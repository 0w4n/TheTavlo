import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import useAuth from "#core/auth/presentation/hooks/useAuth";
import { withReturnTo } from "#core/routing/returnTo";
import { Button } from "#components/atoms/button";
import LoadingPage from "#components/pages/LoadingPage";
import { InvitationApiClient, parsePanelDocPath, } from "../../infraestructure/invitationApiClient";
import "./invitationGate.css";
/**
 * `/invitation/:invitationId?token=...` — la única pantalla de toda la app
 * que debe funcionar SIN sesión (ver Q5 de la conversación de
 * invitaciones): un link privado se resuelve igual, y recién si hace falta
 * aceptar/rechazar mandamos a `/login` con `returnTo` de vuelta acá mismo.
 */
export default function InvitationGate() {
    const { invitationId } = useParams();
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token") ?? "";
    const navigate = useNavigate();
    const { state: authState } = useAuth();
    const [access, setAccess] = useState(null);
    const [loading, setLoading] = useState(true);
    const [responding, setResponding] = useState(false);
    const [actionError, setActionError] = useState(null);
    const currentUrl = `/invitation/${invitationId}?token=${token}`;
    useEffect(() => {
        if (!invitationId || !token) {
            setLoading(false);
            return;
        }
        // Esperamos a que Firebase Auth resuelva su estado inicial: si
        // llamamos a resolveAccess antes, perdemos la sesión (aunque exista)
        // y una invitación privada se ve como "not-invited" por error.
        if (authState.status === "initializing")
            return;
        let cancelled = false;
        setLoading(true);
        InvitationApiClient.resolveAccess({ invitationId, token })
            .then((result) => {
            if (!cancelled)
                setAccess(result);
        })
            .catch(() => {
            if (!cancelled)
                setAccess({ kind: "not-found" });
        })
            .finally(() => {
            if (!cancelled)
                setLoading(false);
        });
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [invitationId, token, authState.status]);
    const goToPanel = (path) => {
        const parsed = parsePanelDocPath(path?.path);
        if (!parsed)
            return;
        navigate(`/shared/${parsed.ownerAccountType}/${parsed.ownerId}/${parsed.panelId}`, { replace: true });
    };
    const handleRespond = async (response) => {
        if (!invitationId)
            return;
        setResponding(true);
        setActionError(null);
        try {
            await InvitationApiClient.respond({ invitationId, token, response });
            if (response === "accept" && access && "invitation" in access) {
                goToPanel(access.invitation.targetRef);
                return;
            }
            const refreshed = await InvitationApiClient.resolveAccess({ invitationId, token });
            setAccess(refreshed);
        }
        catch (error) {
            setActionError(error instanceof Error
                ? error.message
                : "No se pudo procesar tu respuesta.");
        }
        finally {
            setResponding(false);
        }
    };
    if (!invitationId || !token) {
        return (_jsx(InvitationMessage, { title: "Enlace inv\u00E1lido", description: "Falta informaci\u00F3n en el enlace de invitaci\u00F3n." }));
    }
    if (loading || authState.status === "initializing") {
        return _jsx(LoadingPage, {});
    }
    if (!access) {
        return (_jsx(InvitationMessage, { title: "Algo sali\u00F3 mal", description: "No pudimos comprobar esta invitaci\u00F3n. Intenta de nuevo." }));
    }
    switch (access.kind) {
        case "not-found":
            return (_jsx(InvitationMessage, { title: "Invitaci\u00F3n no encontrada", description: "Este enlace no existe o ya no es v\u00E1lido." }));
        case "expired":
            return (_jsx(InvitationMessage, { title: "Invitaci\u00F3n vencida", description: "P\u00EDdele a quien te invit\u00F3 que te comparta un enlace nuevo." }));
        case "revoked":
            return (_jsx(InvitationMessage, { title: "Invitaci\u00F3n revocada", description: "Quien te invit\u00F3 cancel\u00F3 el acceso." }));
        case "public":
            return (_jsx(InvitationMessage, { title: "Te invitaron a un panel", description: "Cualquiera con este enlace puede verlo.", children: _jsx(Button, { variant: "primary", label: "Entrar al panel", onClick: () => goToPanel(access.invitation.targetRef) }) }));
        case "private-accepted":
            return (_jsx(InvitationMessage, { title: "Ya tienes acceso a este panel", children: _jsx(Button, { variant: "primary", label: "Entrar al panel", onClick: () => goToPanel(access.invitation.targetRef) }) }));
        case "private-rejected":
            return (_jsx(InvitationMessage, { title: "Ya rechazaste esta invitaci\u00F3n", description: "Si cambiaste de opini\u00F3n, p\u00EDdele a quien te invit\u00F3 que la vuelva a mandar." }));
        case "not-invited": {
            if (authState.status !== "authenticated") {
                return (_jsx(InvitationMessage, { title: "Inicia sesi\u00F3n para continuar", description: "Esta invitaci\u00F3n es privada \u2014 necesitamos saber qui\u00E9n eres antes de mostr\u00E1rtela.", children: _jsx(Button, { variant: "primary", label: "Iniciar sesi\u00F3n", onClick: () => navigate(withReturnTo("/login", currentUrl)) }) }));
            }
            return (_jsx(InvitationMessage, { title: "Esta invitaci\u00F3n no es para tu cuenta", description: "P\u00EDdele a quien te invit\u00F3 que revise el correo con el que te agreg\u00F3." }));
        }
        case "private-pending": {
            if (authState.status !== "authenticated") {
                return (_jsx(InvitationMessage, { title: "Inicia sesi\u00F3n para continuar", description: "Necesitas iniciar sesi\u00F3n para aceptar o rechazar esta invitaci\u00F3n.", children: _jsx(Button, { variant: "primary", label: "Iniciar sesi\u00F3n", onClick: () => navigate(withReturnTo("/login", currentUrl)) }) }));
            }
            // Q4: una cuenta anónima ("guests") no puede aceptar — debe completar
            // el registro primero (mismo flujo que MigrationDialog ya cubre).
            if (authState.user.accountType === "guests") {
                return (_jsx(InvitationMessage, { title: "Completa tu cuenta primero", description: "Est\u00E1s en modo invitado. Antes de aceptar esta invitaci\u00F3n, termina de crear tu cuenta.", children: _jsx(Button, { variant: "secondary", label: "Volver", onClick: () => navigate("/home") }) }));
            }
            return (_jsxs(InvitationMessage, { title: "Te invitaron a colaborar", description: "\u00BFAceptas la invitaci\u00F3n?", children: [actionError && _jsx("p", { className: "invitation-gate__error", children: actionError }), _jsxs("div", { className: "invitation-gate__actions", children: [_jsx(Button, { variant: "ghost", label: "Rechazar", disabled: responding, onClick: () => handleRespond("reject") }), _jsx(Button, { variant: "primary", label: "Aceptar", disabled: responding, onClick: () => handleRespond("accept") })] })] }));
        }
        default:
            return null;
    }
}
function InvitationMessage({ title, description, children, }) {
    return (_jsx("div", { className: "invitation-gate", children: _jsxs("div", { className: "invitation-gate__card", children: [_jsx("h1", { children: title }), description && _jsx("p", { children: description }), children] }) }));
}
