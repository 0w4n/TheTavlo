import { StrictMode, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";
import "@tabler/icons-webfont/dist/tabler-icons.min.css";

const LandingPage = lazy(() => import("#components/pages/LandingPage"));
const LEGACY = ["/login", "/home", "/invitation", "/shared"];
const { pathname, search } = window.location;
const isApp = pathname === "/app" || pathname.startsWith("/app/");
const isLegacy = LEGACY.some((p) => pathname === p || pathname.startsWith(`${p}/`));

const AuthenticatedApp = lazy(() => import("./App"));

if (!isApp && isLegacy) {
  window.location.replace(`/app${pathname}${search}`);
} else {
  if (isApp) {
    // Arranca la descarga de la ruta ya, en paralelo con App/auth/Firestore.
    // (Vite deduplica: es el mismo import() que usa routes.tsx)
    if (pathname === "/app/home" || pathname === "/app/home/") {
      void import("#components/pages/HomePage");
    } else {
      void import("#components/pages/PanelRoute");
    }
  }
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      {isApp ? (
        <Suspense fallback={null}>
          <AuthenticatedApp />
        </Suspense>
      ) : (
      <Suspense fallback={null}>
        <LandingPage />
      </Suspense>
      )}
    </StrictMode>,
  );
}