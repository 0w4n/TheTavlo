import { jsx as _jsx } from "react/jsx-runtime";
import { ProtectedLayout } from "../../App";
import panelLoader from "./loaders/panel.loader";
import sharedPanelLoader from "./loaders/sharedPanel.loader";
import { Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import LoadingPage from "#components/pages/LoadingPage";
const HomePage = lazy(() => import("#components/pages/HomePage"));
const LoginPage = lazy(() => import("#components/pages/LoginPage"));
const PanelRoute = lazy(() => import("#components/pages/PanelRoute"));
const ErrorPage = lazy(() => import("#components/pages/error"));
const CommingPage = lazy(() => import("#components/pages/Comming"));
const NotFoundPage = lazy(() => import("#components/pages/NotFoundPage"));
const InvitationGate = lazy(() => import("#features/invitations/presentation/pages/InvitationGate"));
export const routes = [
    {
        path: "/login",
        element: (_jsx(Suspense, { fallback: _jsx(LoadingPage, {}), children: _jsx(LoginPage, {}) })),
    },
    {
        element: _jsx(ProtectedLayout, {}),
        children: [
            {
                path: "/home",
                id: "home",
                errorElement: (_jsx(Suspense, { fallback: _jsx(LoadingPage, {}), children: _jsx(ErrorPage, {}) })),
                children: [
                    {
                        index: true,
                        id: "home-index",
                        element: (_jsx(Suspense, { fallback: _jsx(LoadingPage, {}), children: _jsx(HomePage, {}) })),
                    },
                    {
                        // Vista global de calendario (todos los paneles). Todavía no
                        // implementada: por ahora es una página estática de "En
                        // construcción", no pasa por el loader de paneles.
                        path: "calendar",
                        id: "home-calendar",
                        element: (_jsx(Suspense, { fallback: _jsx(LoadingPage, {}), children: _jsx(CommingPage, {}) })),
                    },
                    {
                        // Captura TODA la cadena "home/:pid[/:pid...][/task[/:tid] |
                        // /calendar[/:eid]]" de una sola vez. React Router matchea las
                        // rutas estáticas de arriba (index, "calendar") antes que este
                        // wildcard, así que el orden en el array no importa.
                        //
                        // La gramática de la cadena vive en panelPath.ts, no acá — este
                        // archivo no necesita cambiar para agregar un nivel más de
                        // anidamiento o una vista nueva.
                        path: "*",
                        id: "panel",
                        loader: panelLoader,
                        element: (_jsx(Suspense, { fallback: _jsx(LoadingPage, {}), children: _jsx(PanelRoute, {}) })),
                        errorElement: (_jsx(Suspense, { fallback: _jsx(LoadingPage, {}), children: _jsx(ErrorPage, {}) })),
                    },
                ],
            },
            {
                // Panel compartido (invitación aceptada o enlace público) — vive en
                // el árbol de OTRO dueño, así que NO cuelga de "/home" (que solo
                // resuelve la cadena del homePanel del usuario actual vía
                // panelLoader). Va como hermano de "/home", no como hijo: sigue
                // protegido por ProtectedLayout, pero es su propia raíz de URL.
                // Reutiliza el mismo <PanelRoute/> porque ambos loaders devuelven
                // el mismo PanelLoaderData.
                path: "/shared/:ownerAccountType/:ownerId/:panelId",
                id: "shared-panel",
                loader: sharedPanelLoader,
                element: (_jsx(Suspense, { fallback: _jsx(LoadingPage, {}), children: _jsx(PanelRoute, {}) })),
                errorElement: (_jsx(Suspense, { fallback: _jsx(LoadingPage, {}), children: _jsx(ErrorPage, {}) })),
            },
        ],
    },
    {
        path: "/",
        element: _jsx(Navigate, { to: "/home", replace: true }),
    },
    {
        // Única pantalla pública además de /login — ver InvitationGate.tsx:
        // debe poder resolverse SIN sesión (un link privado igual dice "inicia
        // sesión para continuar" en vez de redirigir a ciegas).
        path: "/invitation/:invitationId",
        element: (_jsx(Suspense, { fallback: _jsx(LoadingPage, {}), children: _jsx(InvitationGate, {}) })),
    },
    {
        // 404 real — antes esta ruta devolvía <CommingPage/> ("En construcción"),
        // que ahora es solo para "/home/calendar" (feature futura, no URL rota).
        path: "*",
        id: "not-found",
        element: (_jsx(Suspense, { fallback: _jsx(LoadingPage, {}), children: _jsx(NotFoundPage, {}) })),
    },
];
