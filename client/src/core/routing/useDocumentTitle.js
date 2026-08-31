import { useEffect } from "react";
const APP_NAME = "TheTavlo";
/**
 * Actualiza `document.title` con la ubicación actual dentro de la app.
 *
 * No depende del tamaño de pantalla: sirve igual para reconocer la pestaña
 * del navegador en desktop con 20 pestañas abiertas que para el selector de
 * apps recientes de un PWA instalado en el celular (que muestra este mismo
 * título, no la URL).
 *
 * Restaura el título anterior al desmontar para no dejar "pisado" el título
 * de una vista si algo la desmonta fuera del flujo normal de navegación.
 */
export function useDocumentTitle(title) {
    useEffect(() => {
        const previous = document.title;
        document.title = title ? `${title} - ${APP_NAME}` : APP_NAME;
        return () => {
            document.title = previous;
        };
    }, [title]);
}
