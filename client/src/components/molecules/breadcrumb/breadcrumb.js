import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link, useNavigate } from "react-router-dom";
import { buildPanelPath } from "#core/routing/panelPath";
import Icon from "#shared/ui/atoms/icons";
import { Dropdown } from "#components/molecules/dropdown";
import "./breadcrumb.css";
/** A partir de cuántos crumbs navegables colapsamos los del medio en un "…". */
const COLLAPSE_THRESHOLD = 3;
function panelCrumbs(panels) {
    return panels.map((panel, index) => {
        if (index === 0) {
            return {
                id: panel.id,
                label: panel.name || "Inicio",
                icon: "IconHome",
                href: "/home",
            };
        }
        const idsFromHome = panels.slice(1, index + 1).map((p) => p.id);
        return {
            id: panel.id,
            label: panel.name || "Panel",
            icon: panel.icon || "IconFolder",
            href: buildPanelPath(idsFromHome),
        };
    });
}
export default function Breadcrumb({ panels, currentLabel, currentIcon, }) {
    const navigate = useNavigate();
    if (panels.length === 0)
        return null;
    const allPanelCrumbs = panelCrumbs(panels);
    const hasViewCrumb = Boolean(currentLabel);
    // El último crumb ("acá estás") nunca es un link. Si hay una vista
    // (Tareas/Calendario) esa es el final; si no, lo es el propio panel.
    const linkable = hasViewCrumb
        ? allPanelCrumbs
        : allPanelCrumbs.slice(0, -1);
    const current = hasViewCrumb
        ? { label: currentLabel, icon: currentIcon }
        : {
            label: allPanelCrumbs[allPanelCrumbs.length - 1].label,
            icon: allPanelCrumbs[allPanelCrumbs.length - 1].icon,
        };
    // Colapsar: dejar Inicio + los últimos dos ancestros visibles, ocultar el
    // resto atrás de un "…". Se complementa (no reemplaza) con scroll
    // horizontal por CSS para el caso extremo en que ni así entre — así no
    // dependemos de breakpoints específicos para que funcione en cualquier
    // ancho de pantalla.
    let visible = linkable;
    let hidden = [];
    if (linkable.length > COLLAPSE_THRESHOLD) {
        const head = linkable[0];
        const tail = linkable.slice(-2);
        hidden = linkable.slice(1, linkable.length - 2);
        visible = [head, ...tail];
    }
    return (_jsx("nav", { "aria-label": "Ruta de navegaci\u00F3n", className: "breadcrumb", children: _jsxs("ol", { className: "breadcrumb__list", children: [visible.map((crumb, index) => (_jsxs("li", { className: "breadcrumb__item", children: [_jsxs(Link, { to: crumb.href, className: "breadcrumb__link", children: [crumb.icon && (_jsx(Icon, { name: crumb.icon, size: 14, "aria-hidden": "true" })), _jsx("span", { className: "breadcrumb__label", children: crumb.label })] }), index === 0 && hidden.length > 0 && (_jsx("span", { className: "breadcrumb__ellipsis-wrap", children: _jsx(Dropdown, { trigger: _jsx("button", { type: "button", className: "breadcrumb__ellipsis", "aria-label": `Mostrar ${hidden.length} paneles intermedios`, children: _jsx(Icon, { name: "IconDots", size: 14, "aria-hidden": "true" }) }), children: hidden.map((hiddenCrumb) => (_jsx(Dropdown.Item, { icon: hiddenCrumb.icon || "IconFolder", label: hiddenCrumb.label, onClick: () => navigate(hiddenCrumb.href) }, hiddenCrumb.id))) }) }))] }, crumb.id))), _jsxs("li", { className: "breadcrumb__item breadcrumb__item--current", "aria-current": "page", children: [current.icon && (_jsx(Icon, { name: current.icon, size: 14, "aria-hidden": "true" })), _jsx("span", { className: "breadcrumb__label breadcrumb__label--current", children: current.label })] })] }) }));
}
