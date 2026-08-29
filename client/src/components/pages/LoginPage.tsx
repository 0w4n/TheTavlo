import { useEffect, useState } from "react";
import useAuth from "../../core/auth/presentation/hooks/useAuth";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "#components/atoms/button";
import { useDocumentTitle } from "#core/routing/useDocumentTitle";
import OnboardingPage from "#features/onBoarding/components/pages/OnboardingPage";

import "./LoginPage.css";

export default function LoginPage() {
  useDocumentTitle("Iniciar sesión");

  const { state } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      navigate("/login?onBoarding", { replace: true });
    } catch (error) {
      console.error("Error al iniciar sesión con Google:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestSignIn = async () => {
    setIsLoading(true);
    try {
      navigate("/login?onBoarding", { replace: true });
    } catch (error) {
      throw new Error(error as string);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (state.status === "authenticated") {
      navigate("/home", { replace: true });
    }
  });

  // /login?onBoarding — mismo login, pero guiado. Ver OnboardingPage.tsx.
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
          label="Entrar con Google"
          disabled={isLoading || state.status === "initializing"}
        />
        <Button
          className="loginPage__card-content-item"
          variant="secondary"
          onClick={handleGuestSignIn}
          icon="IconSpy"
          label="Entrar como Invitado"
          disabled={isLoading || state.status === "initializing"}
        />
      </div>

      <footer>
        <span>
          Para crear una cuenta es <strong>aquí también</strong>.
        </span>
      </footer>

      {/* La nota de "modo invitado" que vivía comentada acá ahora está en
          OnboardingPage.tsx (StepAuth) — ver /login?onBoarding. */}
    </div>
  );
}
