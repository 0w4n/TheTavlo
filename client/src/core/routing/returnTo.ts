/**
 * Solo se acepta un `returnTo` relativo (empieza con "/", y no con "//" —
 * eso sería un protocol-relative URL a otro host) para evitar un open
 * redirect si alguien arma el link de invitación/login a mano.
 *
 * Se usa en LoginPage y OnboardingPage para volver adonde estaba el
 * usuario antes de pedirle sesión — hoy el caso real es
 * `/invitation/:invitationId`, pero sirve para cualquier página pública
 * que necesite pedir login a mitad de camino.
 */
export function safeReturnTo(raw: string | null): string | null {
  if (!raw) return null;
  if (!raw.startsWith("/") || raw.startsWith("//")) return null;
  return raw;
}

export function withReturnTo(path: string, returnTo: string | null): string {
  if (!returnTo) return path;
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}returnTo=${encodeURIComponent(returnTo)}`;
}
