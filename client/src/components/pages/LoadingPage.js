import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export default function LoadingPage() {
    return (_jsxs("div", { style: {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            flexDirection: "column",
            gap: "1rem",
        }, children: [_jsx("div", { className: "spin" }), _jsx("p", { children: "Cargando TheTavlo..." })] }));
}
