export type PanelRole = "owner" | "editor" | "viewer" | "unknown";
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
export declare function usePanelRole(): PanelRole;
