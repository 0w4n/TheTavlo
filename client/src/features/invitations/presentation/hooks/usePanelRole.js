import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { firebaseService } from "#shared/infraestructure/firebase/firebaseConfig";
import useGlobalContext from "#core/globalContext/hooks/useGlobalContext";
/**
 * Rol del usuario actual sobre el panel activo (Q3 de la conversación de
 * invitaciones: se usa para ocultar en la UI acciones como "Eliminar" o
 * "Compartir" — la barrera real sigue siendo `firestore.rules` +
 * `invitations.router.ts` en el backend, esto es solo la mitad de UX).
 *
 * - "owner" si el panel no tiene `ownerId` (panel propio) o coincide con
 *   el usuario actual.
 * - Si no, lee en vivo `sharedPanelIndex/{uid}/panels/{panelId}` — lo
 *   escribe el backend con privilegios de admin al aceptar una invitación
 *   (`invitations.router.ts`, procedure `respond`).
 * - "unknown" mientras se resuelve, si no hay panel activo, o si el
 *   usuario no tiene (o perdió) acceso — la UI debe tratarlo igual que
 *   "viewer" para cualquier acción de escritura.
 */
export function usePanelRole() {
    const { state } = useGlobalContext();
    const { panel, user } = state;
    const isOwner = !panel.ownerId || panel.ownerId === user.userId;
    const [role, setRole] = useState(isOwner ? "owner" : "unknown");
    useEffect(() => {
        if (isOwner) {
            setRole("owner");
            return;
        }
        if (!panel.panelId || !user.userId) {
            setRole("unknown");
            return;
        }
        const ref = doc(firebaseService.firestore, "sharedPanelIndex", user.userId, "panels", panel.panelId);
        return onSnapshot(ref, (snap) => setRole(snap.data()?.role ?? "unknown"), () => setRole("unknown"));
    }, [isOwner, panel.panelId, user.userId]);
    return role;
}
