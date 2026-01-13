import { useState } from "react";
import useTheme from "#shared/themes/presentation/hooks/useTheme";
import { THEME_PRESETS } from "#shared/themes/domain/theme.preset";
import type {
  ThemeColors,
  ThemeMode,
  ThemePreset,
} from "#shared/themes/domain/theme.entity";
import Icon from "#shared/ui/atoms/icons";
import { Tooltip } from "react-tooltip";
import { Button } from "./atoms/button";

interface ThemeSettingsDialogProps {
  onClose: () => void;
}

export function ThemeSettingsDialog({ onClose }: ThemeSettingsDialogProps) {
  const { resetTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<
    "preset" | "customize" | "accessibility"
  >("preset");

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "var(--color-overlay)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "1rem",
      }}
    >
      <div
        style={{
          background: "var(--color-surface)",
          borderRadius: "var(--border-radius)",
          padding: "2rem",
          maxWidth: "700px",
          width: "100%",
          maxHeight: "90vh",
          overflow: "auto",
          boxShadow: `0 20px 60px var(--color-shadow)`,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.5rem",
          }}
        >
          <h2
            style={{
              margin: 0,
              color: "var(--color-textPrimary)",
              fontSize: "1.5rem",
            }}
          >
            ⚙️ Personalización
          </h2>
          <em>Los cambios todavía no se han guardado</em>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              fontSize: "1.5rem",
              cursor: "pointer",
              color: "var(--color-textSecondary)",
            }}
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            marginBottom: "1.5rem",
            borderBottom: `1px solid var(--color-border)`,
          }}
        >
          {[
            { key: "preset" as const, label: "Temas", icon: "IconPalette" },
            {
              key: "customize" as const,
              label: "Personalizar",
              icon: "IconBrush",
            },
            {
              key: "accessibility" as const,
              label: "Accesibilidad",
              icon: "IconAccesible",
            },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: "0.75rem 1.25rem",
                border: "none",
                background: "transparent",
                borderBottom:
                  activeTab === tab.key
                    ? `3px solid var(--color-primary)`
                    : "3px solid transparent",
                color:
                  activeTab === tab.key
                    ? "var(--color-primary)"
                    : "var(--color-textSecondary)",
                fontWeight: activeTab === tab.key ? "600" : "400",
                cursor: "pointer",
                fontSize: "0.95rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                transition: "all var(--transition-speed)",
              }}
            >
              <Icon name={tab.icon} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "preset" && <PresetTab />}
        {activeTab === "customize" && <CustomizeTab />}
        {activeTab === "accessibility" && <AccessibilityTab />}

        {/* Footer */}
        <div
          style={{
            marginTop: "2rem",
            paddingTop: "1rem",
            borderTop: `1px solid var(--color-border)`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <button
            onClick={resetTheme}
            style={{
              padding: "0.75rem 1.5rem",
              border: `2px solid var(--color-border)`,
              borderRadius: "var(--border-radius)",
              background: "var(--color-background)",
              color: "var(--color-textSecondary)",
              cursor: "pointer",
              fontWeight: "500",
              transition: "all var(--transition-speed)",
            }}
          >
            Restaurar por Defecto
          </button>

          <button
            onClick={onClose}
            style={{
              padding: "0.75rem 2rem",
              border: "none",
              borderRadius: "var(--border-radius)",
              background: "var(--color-primary)",
              color: "white",
              cursor: "pointer",
              fontWeight: "600",
              transition: "all var(--transition-speed)",
            }}
          >
            Guardar y Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

function PresetTab() {
  const { setMode, setPreset } = useTheme();

  const modes: Array<{
    key: ThemeMode;
    label: string;
    icon: string;
  }> = [
    {
      key: "light",
      label: "Claro",
      icon: "IconSun",
    },
    {
      key: "dark",
      label: "Oscuro",
      icon: "IconMoon",
    },
    { key: "auto", label: "Segun sistema", icon: "IconSunMoon" },
  ];

  const presets: Array<{
    key: ThemePreset;
    label: string;
  }> = [
    { key: "default", label: "Por Defecto" },
    { key: "ocean", label: "Océano" },
    { key: "forest", label: "Bosque" },
    { key: "sunset", label: "Atardecer" },
    { key: "midnight", label: "Medianoche" },
  ];

  return (
    <div>
      {/* Mode Selection */}
      <div style={{ marginBottom: "2rem" }}>
        <h3
          style={{
            margin: "0 0 1rem 0",
            fontSize: "1.1rem",
            color: "var(--color-textPrimary)",
          }}
        >
          Modo de Tema
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "1rem",
          }}
        >
          {modes.map((mode) => (
            <Button
              key={mode.key}
              onClick={() => setMode(mode.key)}
              className="secondary icon"
              data-tooltip-id="mode"
              data-tooltip-content={mode.label}
              data-tooltip-place="bottom"
            >
              <Icon name={mode.icon} />
              <Tooltip id="mode" />
            </Button>
          ))}
        </div>
      </div>

      {/* Preset Selection */}
      <div>
        <h3
          style={{
            margin: "0 0 1rem 0",
            fontSize: "1.1rem",
            color: "var(--color-textPrimary)",
          }}
        >
          Temas Predefinidos
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, 1fr)",
            gap: "1rem",
          }}
        >
          {presets.map((preset) => {
            const presetColors = THEME_PRESETS[preset.key].light;

            return (
              <button
                key={preset.key}
                onClick={() => setPreset(preset.key)}
                className="tertiary"
              >
                {/* Color Preview */}
                <div
                  style={{
                    display: "flex",
                    gap: "4px",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      background: presetColors.primary,
                    }}
                  />
                  <div
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      background: presetColors.secondary,
                    }}
                  />
                  <div
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      background: presetColors.success,
                    }}
                  />
                </div>

                <div
                  style={{
                    fontWeight: "600",
                    fontSize: "0.75rem",
                    color: "var(--color-textPrimary)",
                  }}
                >
                  {preset.label}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function CustomizeTab() {
  const { colors, setCustomColor } = useTheme();
  const [editingColor, setEditingColor] = useState<
    keyof ThemeColors | undefined
  >(undefined);

  const colorGroups: Array<{
    title: string;
    colors: Array<{ key: keyof ThemeColors; label: string }>;
  }> = [
    {
      title: "Colores Principales",
      colors: [
        { key: "primary", label: "Primario" },
        { key: "primaryLight", label: "Primario Claro" },
        { key: "primaryDark", label: "Primario Oscuro" },
        { key: "secondary", label: "Secundario" },
        { key: "secondaryLight", label: "Secundario Claro" },
        { key: "secondaryDark", label: "Secundario Oscuro" },
      ],
    },
    {
      title: "Colores de Fondo",
      colors: [
        { key: "background", label: "Fondo Principal" },
        { key: "backgroundSecondary", label: "Fondo Secundario" },
        { key: "surface", label: "Superficie" },
      ],
    },
    {
      title: "Colores Semánticos",
      colors: [
        { key: "success", label: "Éxito" },
        { key: "warning", label: "Advertencia" },
        { key: "error", label: "Error" },
        { key: "info", label: "Información" },
      ],
    },
  ];

  const handleColorChange = async (key: keyof ThemeColors, value: string) => {
    try {
      await setCustomColor(key, value);
      setEditingColor(key);
    } catch {
      alert("Color inválido. Usa formato hexadecimal (ej: #667eea)");
    }
  };

  return (
    <div>
      <div
        style={{
          padding: "1rem",
          background: "var(--color-warningLight)",
          border: `1px solid var(--color-warning)`,
          borderRadius: "var(--border-radius)",
          marginBottom: "1.5rem",
          fontSize: "0.9rem",
          color: "var(--color-textPrimary)",
        }}
      >
        💡 <strong>Nota:</strong> Personalizar colores cambiará automáticamente
        al tema "Personalizado"
      </div>

      {colorGroups.map((group) => (
        <div key={group.title} style={{ marginBottom: "2rem" }}>
          <h3
            style={{
              margin: "0 0 1rem 0",
              fontSize: "1rem",
              color: "var(--color-textPrimary)",
            }}
          >
            {group.title}
          </h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
              gap: "1rem",
            }}
          >
            {group.colors.map(({ key, label }) => {
              const isActive = editingColor === key;

              return (
                <div
                  key={key}
                  style={{
                    padding: "1rem",
                    border: isActive
                      ? "2px solid var(--color-primary)"
                      : "1px solid var(--color-border)",
                    borderRadius: "var(--border-radius)",
                    background: isActive
                      ? "var(--color-primaryLight)20"
                      : "var(--color-background)",
                    boxShadow: isActive
                      ? "0 0 12px var(--color-primaryLight)"
                      : "none",
                    transition: "all 0.25s ease",
                    transform: isActive ? "scale(1.02)" : "scale(1)",
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      height: "60px",
                      borderRadius: "var(--border-radius)",
                      background: colors[key],
                      marginBottom: "0.75rem",
                      border: `1px solid var(--color-border)`,
                      transition: "all 0.25s ease",
                    }}
                  />

                  <div
                    style={{
                      fontWeight: "600",
                      marginBottom: "0.5rem",
                      fontSize: "0.85rem",
                      color: "var(--color-textPrimary)",
                    }}
                  >
                    {label}
                  </div>

                  <input
                    type="text"
                    value={colors[key]}
                    onChange={(e) => {
                      if (e.target.value.length === 7) {
                        handleColorChange(key, e.target.value);
                      }
                    }}
                    placeholder="#667eea"
                    style={{
                      width: "100%",
                      padding: "0.5rem",
                      border: `1px solid var(--color-border)`,
                      borderRadius: "var(--border-radius)",
                      fontSize: "0.8rem",
                      fontFamily: "monospace",
                      background: "var(--color-surface)",
                      color: "var(--color-textPrimary)",
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function AccessibilityTab() {
  const { config, setFontSize, setBorderRadius, toggleAnimations } = useTheme();

  return (
    <div>
      {/* Font Size */}
      <div style={{ marginBottom: "2rem" }}>
        <h3
          style={{
            margin: "0 0 1rem 0",
            fontSize: "1.1rem",
            color: "var(--color-textPrimary)",
          }}
        >
          Tamaño de Fuente
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "1rem",
          }}
        >
          {(["small", "medium", "large"] as const).map((size) => (
            <button
              key={size}
              onClick={() => setFontSize(size)}
              style={{
                padding: "1.5rem 1rem",
                border:
                  config.fontSize === size
                    ? `2px solid var(--color-primary)`
                    : `2px solid var(--color-border)`,
                borderRadius: "var(--border-radius)",
                background:
                  config.fontSize === size
                    ? "var(--color-primaryLight)20"
                    : "var(--color-background)",
                cursor: "pointer",
                transition: "all var(--transition-speed)",
              }}
            >
              <div
                style={{
                  fontSize:
                    size === "small"
                      ? "0.875rem"
                      : size === "large"
                      ? "1.125rem"
                      : "1rem",
                  fontWeight: "600",
                  color: "var(--color-textPrimary)",
                }}
              >
                Aa
              </div>
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "var(--color-textSecondary)",
                  marginTop: "0.5rem",
                  textTransform: "capitalize",
                }}
              >
                {size === "small"
                  ? "Pequeño"
                  : size === "large"
                  ? "Grande"
                  : "Mediano"}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Border Radius */}
      <div style={{ marginBottom: "2rem" }}>
        <h3
          style={{
            margin: "0 0 1rem 0",
            fontSize: "1.1rem",
            color: "var(--color-textPrimary)",
          }}
        >
          Bordes
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "1rem",
          }}
        >
          {(["square", "rounded", "pill"] as const).map((radius) => (
            <button
              key={radius}
              onClick={() => setBorderRadius(radius)}
              style={{
                padding: "1rem",
                border:
                  config.borderRadius === radius
                    ? `2px solid var(--color-primary)`
                    : `2px solid var(--color-border)`,
                borderRadius:
                  radius === "square"
                    ? "0px"
                    : radius === "rounded"
                    ? "8px"
                    : "999px",
                background:
                  config.borderRadius === radius
                    ? "var(--color-primaryLight)20"
                    : "var(--color-background)",
                cursor: "pointer",
                transition: "all var(--transition-speed)",
              }}
            >
              <div
                style={{
                  width: "60px",
                  height: "40px",
                  background: "var(--color-primary)",
                  borderRadius:
                    radius === "square"
                      ? "0px"
                      : radius === "rounded"
                      ? "8px"
                      : "999px",
                  margin: "0 auto 0.75rem",
                }}
              />
              <div
                style={{
                  fontSize: "0.85rem",
                  color: "var(--color-textPrimary)",
                  fontWeight: "600",
                  textTransform: "capitalize",
                }}
              >
                {radius === "square"
                  ? "Cuadrado"
                  : radius === "rounded"
                  ? "Redondeado"
                  : "Píldora"}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Animations */}
      <div>
        <h3
          style={{
            margin: "0 0 1rem 0",
            fontSize: "1.1rem",
            color: "var(--color-textPrimary)",
          }}
        >
          Animaciones
        </h3>
        <div
          onClick={toggleAnimations}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "1.25rem",
            border: `1px solid var(--color-border)`,
            borderRadius: "var(--border-radius)",
            background: "var(--color-background)",
            cursor: "pointer",
          }}
        >
          <div>
            <div
              style={{
                fontWeight: "600",
                marginBottom: "0.25rem",
                color: "var(--color-textPrimary)",
              }}
            >
              Reducir movimiento
            </div>
            <div
              style={{
                fontSize: "0.85rem",
                color: "var(--color-textSecondary)",
              }}
            >
              Desactiva las transiciones y animaciones
            </div>
          </div>
          <div
            style={{
              width: "50px",
              height: "28px",
              borderRadius: "14px",
              background: config.animations
                ? "var(--color-primary)"
                : "var(--color-border)",
              position: "relative",
              transition: "background 0.3s",
            }}
          >
            <div
              style={{
                width: "22px",
                height: "22px",
                borderRadius: "50%",
                background: "white",
                position: "absolute",
                top: "3px",
                left: config.animations ? "25px" : "3px",
                transition: "left 0.3s",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
