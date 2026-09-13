import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { firebaseService } from "#core/appCore/infraestructure/firebase/firebaseConfig";
import useGlobalContext from "#core/globalContext/hooks/useGlobalContext";

export type PanelRole = "owner" | "editor" | "viewer" | "unknown" | "loading";

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
export function usePanelRole(): PanelRole {
  const { state } = useGlobalContext();
  const panel = state.status === "ready" ? state.state.panel : undefined;
  const user = state.status === "ready" ? state.state.user : undefined;
  const isOwner = Boolean(
    panel && user && (!panel.ownerId || panel.ownerId === user.userId),
  );

  const [role, setRole] = useState<PanelRole>("loading");

  useEffect(() => {
    if (!panel || !user) {
      setRole("unknown");
      return;
    }

    if (isOwner) {
      setRole("owner");
      return;
    }
    if (!panel.panelId || !user.userId) {
      setRole("unknown");
      return;
    }

    setRole("loading");
    const indexRef = doc(
      firebaseService.firestore,
      "sharedPanelIndex",
      user.userId,
      "panels",
      panel.panelId,
    );

    const unsubscribe = onSnapshot(
      indexRef,
      (snap) => {
        const data = snap.data() as { role?: PanelRole } | undefined;
        setRole(data?.role ?? "unknown");
      },
      () => setRole("unknown"),
    );

    return unsubscribe;
  }, [isOwner, panel?.panelId, panel?.ownerId, user?.userId]);

  return role;
}
