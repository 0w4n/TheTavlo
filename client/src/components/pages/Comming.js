import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import Icon from "#shared/ui/atoms/icons";
import { Link } from "react-router-dom";
export default function CommingPage() {
    return (_jsx(_Fragment, { children: _jsxs("div", { children: [_jsx("h1", { children: "Estamos en ello" }), _jsx(Icon, { name: "IconBuilding" }), _jsx("button", { children: _jsx(Link, { to: "/home", replace: true }) })] }) }));
}
