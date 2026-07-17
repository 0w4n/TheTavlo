import { ProtectedLayout } from "../../App";
import panelLoader from "./loaders/panel.loader";
import { Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import LoadingPage from "#components/pages/LoadingPage";
// import invitationsLoader from "./loaders/invitation.loader";

const HomePage = lazy(() => import("#components/pages/HomePage"));
const LoginPage = lazy(() => import("#components/pages/LoginPage"));
const PanelRoute = lazy(() => import("#components/pages/PanelRoute"));
const ErrorPage = lazy(() => import("#components/pages/error"));
const CommingPage = lazy(() => import("#components/pages/Comming"));
const NotFoundPage = lazy(() => import("#components/pages/NotFoundPage"));

export const routes = [
  {
    path: "/login",
    element: (
      <Suspense fallback={<LoadingPage />}>
        <LoginPage />
      </Suspense>
    ),
  },
  {
    element: <ProtectedLayout />,
    children: [
      {
        path: "/home",
        id: "home",
        errorElement: (
          <Suspense fallback={<LoadingPage />}>
            <ErrorPage />
          </Suspense>
        ),
        children: [
          {
            index: true,
            id: "home-index",
            element: (
              <Suspense fallback={<LoadingPage />}>
                <HomePage />
              </Suspense>
            ),
          },
          {
            // Vista global de calendario (todos los paneles). Todavía no
            // implementada: por ahora es una página estática de "En
            // construcción", no pasa por el loader de paneles.
            path: "calendar",
            id: "home-calendar",
            element: (
              <Suspense fallback={<LoadingPage />}>
                <CommingPage />
              </Suspense>
            ),
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
            element: (
              <Suspense fallback={<LoadingPage />}>
                <PanelRoute />
              </Suspense>
            ),
            errorElement: (
              <Suspense fallback={<LoadingPage />}>
                <ErrorPage />
              </Suspense>
            ),
          },
        ],
      },
    ],
  },
  {
    path: "/",
    element: <Navigate to="/home" replace />,
  },
  // {
  //   path: "/invitation/:invitacionId",
  //   loader: invitationsLoader,
  //   element: ,
  //   errorElement: <ErrorPage />,
  // },
  {
    // 404 real — antes esta ruta devolvía <CommingPage/> ("En construcción"),
    // que ahora es solo para "/home/calendar" (feature futura, no URL rota).
    path: "*",
    id: "not-found",
    element: (
      <Suspense fallback={<LoadingPage />}>
        <NotFoundPage />
      </Suspense>
    ),
  },
];
