import { useEffect, useRef, useState } from "react";
import useAuth from "../../core/auth/presentation/hooks/useAuth";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "#components/atoms/button";
import { useDocumentTitle } from "#core/routing/useDocumentTitle";
import { safeReturnTo, withReturnTo } from "#core/routing/returnTo";
import OnboardingPage from "#features/onBoarding/components/pages/OnboardingPage";

import "./LoginPage.css";

export default function LoginPage() {
  useDocumentTitle("Iniciar sesión");

  const { signInWithGoogle, state } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = safeReturnTo(searchParams.get("returnTo"));
  const isSigningInRef = useRef(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    isSigningInRef.current = true;
    try {
      const isNewUser = await signInWithGoogle();
      navigate(
        isNewUser
          ? withReturnTo("/register", returnTo)
          : (returnTo ?? "/home"),
        { replace: true },
      );
    } catch (error) {
      console.error("Error al iniciar sesión con Google:", error);
    } finally {
      isSigningInRef.current = false;
      setIsLoading(false);
    }
  };

  const handleCreateAccount = () => {
    navigate(withReturnTo("/register", returnTo), { replace: true });
  };

  useEffect(() => {
    if (state.status === "authenticated" && !isSigningInRef.current) {
      navigate(returnTo ?? "/home", { replace: true });
    }
  }, [navigate, returnTo, state.status]);

  // Compatibilidad: /login?onBoarding sigue mostrando el onboarding legacy.
  if (searchParams.has("onBoarding")) {
    return <OnboardingPage />;
  }

  return (
    <div className="loginPage__card">
      <div className="loginPage__card-header">
        <h1>Organizalo. Hazlo. Logralo.</h1>
        <i>Inicia sesión en TheTavlo</i>
        {/* <i>Just, organise</i> */}
      </div>

      {state.status === "error" && (
        <div className="loginPage__card-error">{state.error}</div>
      )}

      <div className="loginPage__card-content">
        <Button
          className="loginPage__card-content-item"
          variant="secondary"
          onClick={handleGoogleSignIn}
          icon="IconBrandGoogleFilled"
          label="Iniciar sesión con Google"
          disabled={isLoading || state.status === "initializing"}
        />
        <Button
          className="loginPage__card-content-item"
          variant="secondary"
          onClick={handleCreateAccount}
          icon="IconUserPlus"
          label="Crear una cuenta"
          disabled={isLoading || state.status === "initializing"}
        />
      </div>

      <footer>
        <span>
          Las cuentas nuevas empiezan con una configuración guiada.
        </span>
      </footer>

      {/* La nota de "modo invitado" que vivía comentada acá ahora está en
          OnboardingPage.tsx (StepAuth) — el flujo nuevo usa /register. */}
    </div>
  );
}
