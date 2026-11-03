import { StrictMode, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import LandingPage from "#components/pages/LandingPage";

const LEGACY = ["/login", "/home", "/invitation", "/shared"];
const { pathname, search } = window.location;
const isApp = pathname === "/app" || pathname.startsWith("/app/");
const isLegacy = LEGACY.some((p) => pathname === p || pathname.startsWith(`${p}/`));

const AuthenticatedApp = lazy(() => import("./App"));

if (!isApp && isLegacy) {
  window.location.replace(`/app${pathname}${search}`);
} else {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      {isApp ? (
        <Suspense fallback={null}>
          <AuthenticatedApp />
        </Suspense>
      ) : (
        <LandingPage />
      )}
    </StrictMode>,
  );
}