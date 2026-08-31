/**
 * 404 real. Antes el catch-all "*" de las rutas devolvía <CommingPage/>
 * ("En construcción"), que semánticamente es para features futuras, no para
 * URLs que no existen. Ahora cada una tiene su propio componente.
 */
export default function NotFoundPage(): import("react").JSX.Element;
