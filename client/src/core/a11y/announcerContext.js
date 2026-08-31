import { createContext } from "react";
/**
 * Default no-op: a propósito NO sigue el patrón de otros contexts de este
 * proyecto (que tiran si se usan fuera de su Provider). Quedarse callado es
 * un degradamiento aceptable para una mejora de accesibilidad — un throw no
 * lo es, no queremos romper una página entera porque el anuncio no está
 * disponible (p. ej. en tests que no envuelven el árbol completo).
 */
export const AnnouncerContext = createContext(() => { });
