import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from "react-router-dom";
/**
 * 404 real. Antes el catch-all "*" de las rutas devolvía <CommingPage/>
 * ("En construcción"), que semánticamente es para features futuras, no para
 * URLs que no existen. Ahora cada una tiene su propio componente.
 */
export default function NotFoundPage() {
    return (_jsxs("div", { style: { textAlign: "center", padding: "4rem 1rem" }, children: [_jsx("h1", { children: "404" }), _jsx("p", { children: "La p\u00E1gina que busc\u00E1s no existe." }), _jsx(Link, { to: "/home", children: "Volver al inicio" })] }));
}
