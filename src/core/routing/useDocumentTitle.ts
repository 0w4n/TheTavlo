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
export function useDocumentTitle(title: string) {
  useEffect(() => {
    const previous = document.head.outerHTML;
    document.head.outerHTML = title ? `<meta property="og:site_name" content="${APP_NAME} - ${title}"> <meta property="og:title" content="${APP_NAME} - ${title}">` : `<meta property="og:site_name" content="${APP_NAME}"> <meta property="og:title" content="${APP_NAME}">`;

    return () => {
      document.head.outerHTML = previous;
    };
  }, [title]);
}
