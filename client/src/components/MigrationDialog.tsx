import type { MigrationStrategy } from "../core/auth/domain/migration.entity";
import useAuth from "../core/auth/presentation/hooks/useAuth";
import { useState } from "react";

export default function MigrationDialog() {
  const { state, completeMigration } = useAuth();
  const [loading, setLoading] = useState(false);

  if (state.status !== "migration-pending" || !state.migrationData) {
  if (state.status !== "migration-pending" || !state.migrationData) {
    return null;
  }

  const handleMigration = async (strategy: MigrationStrategy) => {
    setLoading(true);
    try {
      await completeMigration(strategy);
    } catch (error) {
      console.error("Error en migración:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "white",
          padding: "2rem",
          borderRadius: "8px",
          maxWidth: "500px",
        }}
      >
        <h2>¡Ya tienes una cuenta con Google!</h2>
        <p>Detectamos que ya tenías datos en tu cuenta de Google.</p>
        <p>¿Qué quieres hacer con tus datos de invitado?</p>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            marginTop: "1.5rem",
          }}
        >
          <button
            onClick={() => handleMigration("merge")}
            disabled={loading}
            style={{ padding: "1rem" }}
          >
            📦 Combinar todo
            <div style={{ fontSize: "0.85rem", opacity: 0.7 }}>
              Mantener ambos conjuntos de datos
            </div>
          </button>

          <button
            onClick={() => handleMigration("keep-separate")}
            disabled={loading}
            style={{ padding: "1rem" }}
          >
            🗑️ Descartar datos de invitado
            <div style={{ fontSize: "0.85rem", opacity: 0.7 }}>
              Mantener solo los datos de Google
            </div>
          </button>

          <button
            onClick={() => handleMigration("move")}
            disabled={loading}
            style={{ padding: "1rem", opacity: 0.6 }}
          >
            ⚠️ Reemplazar con datos de invitado
            <div style={{ fontSize: "0.85rem", opacity: 0.7 }}>
              Perderás tus datos actuales de Google
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
