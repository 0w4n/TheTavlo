import { createContext } from "react";

/**
 * `Modal` provee aquí su `requestClose` (el que dispara la animación de
 * salida). `ModalHeader` lo consume si está disponible; si `Modal.Header`
 * se usa fuera de un `Modal` (no debería, pero no lo impedimos), cae de
 * vuelta al `onClose` que reciba por props, igual que antes.
 */
export const ModalCloseContext = createContext<(() => void) | null>(null);