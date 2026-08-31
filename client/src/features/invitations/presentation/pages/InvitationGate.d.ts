import "./invitationGate.css";
/**
 * `/invitation/:invitationId?token=...` — la única pantalla de toda la app
 * que debe funcionar SIN sesión (ver Q5 de la conversación de
 * invitaciones): un link privado se resuelve igual, y recién si hace falta
 * aceptar/rechazar mandamos a `/login` con `returnTo` de vuelta acá mismo.
 */
export default function InvitationGate(): import("react").JSX.Element | null;
