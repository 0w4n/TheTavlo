import type {
  CreatePanelDTO,
  PanelColor,
} from "features/panels/domain/panel.entity";
import { useState } from "react";

export default function CreatePanelDialog({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (data: CreatePanelDTO) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState<PanelColor>("blue");
  const [icon, setIcon] = useState("📋");
  const [loading, setLoading] = useState(false);

  const icons = ["📋", "📚", "💼", "🎯", "🏠", "🎨", "⚡", "🌟", "🔥", "💡"];
  const colors: PanelColor[] = [
    "blue",
    "green",
    "purple",
    "orange",
    "red",
    "pink",
    "gray",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onCreate({
        name,
        color,
        icon,
        isDefault: false,
      });
    } catch (error) {
      alert("Error al crear panel");
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
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "12px",
          padding: "2rem",
          maxWidth: "500px",
          width: "90%",
          maxHeight: "90vh",
          overflow: "auto",
        }}
      >
        <h2 style={{ margin: "0 0 1.5rem 0" }}>Crear Nuevo Panel</h2>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1rem" }}>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: "600",
              }}
            >
              Nombre
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Universidad, Freelance, Fitness"
              required
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "2px solid #e0e0e0",
                borderRadius: "6px",
                fontSize: "1rem",
              }}
            />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: "600",
              }}
            >
              Descripción
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción del panel (opcional)"
              rows={3}
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "2px solid #e0e0e0",
                borderRadius: "6px",
                fontSize: "1rem",
                resize: "vertical",
              }}
            />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: "600",
              }}
            >
              Icono
            </label>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {icons.map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIcon(i)}
                  style={{
                    width: "50px",
                    height: "50px",
                    fontSize: "1.5rem",
                    border:
                      icon === i ? "3px solid #667eea" : "2px solid #e0e0e0",
                    borderRadius: "8px",
                    background: icon === i ? "#f0f4ff" : "white",
                    cursor: "pointer",
                  }}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: "600",
              }}
            >
              Color
            </label>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    border:
                      color === c ? "3px solid #333" : "2px solid #e0e0e0",
                    background: getColorValue(c),
                    cursor: "pointer",
                  }}
                />
              ))}
            </div>
          </div>

          <div
            style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                padding: "0.75rem 1.5rem",
                border: "2px solid #e0e0e0",
                borderRadius: "6px",
                background: "white",
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: "1rem",
              }}
              title="cancelar"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !name}
              style={{
                padding: "0.75rem 1.5rem",
                border: "none",
                borderRadius: "6px",
                background: loading || !name ? "#ccc" : "#667eea",
                color: "white",
                cursor: loading || !name ? "not-allowed" : "pointer",
                fontSize: "1rem",
                fontWeight: "600",
              }}
              title="palen"
            >
              {loading ? "Creando..." : "Crear Panel"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function getColorValue(color: PanelColor): string {
  const colors = {
    blue: "#3498db",
    green: "#2ecc71",
    purple: "#9b59b6",
    orange: "#e67e22",
    red: "#e74c3c",
    pink: "#ff6b9d",
    gray: "#95a5a6",
  };
  return colors[color];
}
