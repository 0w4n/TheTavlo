import { jsxs as _jsxs, jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { isRouteErrorResponse, useRouteError } from "react-router-dom";
export default function ErrorPage() {
    let error = useRouteError();
    if (isRouteErrorResponse(error)) {
        return (_jsxs("div", { children: [_jsxs("h1", { children: [error.statusText, " - ", error.status] }), _jsx("p", { children: error.data })] }));
    }
    else if (error instanceof Error) {
        return (_jsxs(_Fragment, { children: [_jsxs("div", { children: [_jsxs("h1", { children: ["Error - ", error.name] }), _jsx("p", { children: error.message })] }), _jsxs("div", { children: [_jsx("p", { children: "El stack es el siguiente:" }), _jsx("p", { children: error.stack })] })] }));
    }
    else {
        return (_jsx(_Fragment, { children: _jsx("h1", { children: "Unkown Error" }) }));
    }
}
