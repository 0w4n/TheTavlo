import { useEffect, useState } from "react";
import useAuth from "../../core/auth/presentation/hooks/useAuth";
import { useNavigate } from "react-router-dom";

import "./LoginPage.css";
import { Button } from "#components/atoms/button";

export default function LoginPage() {
  const { signInAsGuest, signInWithGoogle, state } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Error al iniciar sesión con Google:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestSignIn = async () => {
    setIsLoading(true);
    try {
      await signInAsGuest();
    } catch (error) {
      throw new Error(error as string)
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (state.status === "authenticated") {
      navigate("/home", { replace: true });
    }
  });

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

      {/* <div
        style={{
          marginTop: "2rem",
          padding: "1rem",
          background: "#f8f9fa",
          borderRadius: "6px",
          fontSize: "0.85rem",
          color: "#666",
          lineHeight: "1.5",
        }}
      >
        <strong>💡 Modo Invitado:</strong>
        <br />
        Usa la app sin crear cuenta. Podrás migrar a Google cuando quieras sin
        perder tus datos.
      </div> 
      //TODO: Toca moverlo como parte del onBoarding
      */}
    </div>
  );
}
