import { useState } from "react";
import useAuth from "../core/auth/presentation/hooks/useAuth";
import Icon from "#shared/ui/atoms/icons";

export default function LoginPage() {
  const { signInAsGuest, signInWithGoogle, state } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      console.log("Iniciando sesión como google...");
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
      console.log("Iniciando sesión como invitado...");
      await signInAsGuest();
    } catch (error) {
      console.error("Error al iniciar sesión como invitado:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "2rem",
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "12px",
          padding: "3rem",
          maxWidth: "400px",
          width: "100%",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1
            style={{
              fontSize: "2.5rem",
              margin: "0 0 0.5rem 0",
              color: "#333",
            }}
          >
            TheTavlo
          </h1>
          <p style={{ color: "#666", margin: 0 }}>Organiza tu vida académica</p>
        </div>

        {state.error && (
          <div
            style={{
              background: "#fee",
              border: "1px solid #fcc",
              color: "#c33",
              padding: "0.75rem",
              borderRadius: "6px",
              marginBottom: "1rem",
              fontSize: "0.9rem",
            }}
          >
            {state.error}
          </div>
        )}

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading || state.loading}
            style={{
              padding: "1rem",
              fontSize: "1rem",
              fontWeight: "600",
              border: "none",
              borderRadius: "8px",
              background: "#4285F4",
              color: "white",
              cursor: isLoading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              transition: "all 0.2s",
              opacity: isLoading ? 0.6 : 1,
            }}
            onMouseOver={(e) => {
              if (!isLoading) e.currentTarget.style.background = "#357ae8";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "#4285F4";
            }}
          >
            <Icon name={"IconBrandGoogleFilled"} />
            Continuar con Google
          </button>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              margin: "0.5rem 0",
            }}
          >
            <div style={{ flex: 1, height: "1px", background: "#ddd" }} />
            <span style={{ color: "#999", fontSize: "0.85rem" }}>O</span>
            <div style={{ flex: 1, height: "1px", background: "#ddd" }} />
          </div>

          <button
            onClick={handleGuestSignIn}
            disabled={isLoading || state.loading}
            style={{
              padding: "1rem",
              fontSize: "1rem",
              fontWeight: "500",
              border: "2px solid #ddd",
              borderRadius: "8px",
              background: "white",
              color: "#333",
              cursor: isLoading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              transition: "all 0.2s",
              opacity: isLoading ? 0.6 : 1,
            }}
            onMouseOver={(e) => {
              if (!isLoading) {
                e.currentTarget.style.background = "#f8f8f8";
                e.currentTarget.style.borderColor = "#999";
              }
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "white";
              e.currentTarget.style.borderColor = "#ddd";
            }}
          >
            <Icon name={"IconSpy"} />
            Continuar como Invitado
          </button>
        </div>

        <div
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
      </div>
    </div>
  );
}
