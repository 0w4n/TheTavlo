import type { ThemeColors, ThemePreset } from "./theme.entity";

export const THEME_PRESETS: Record<
  ThemePreset,
  { light: ThemeColors; dark: ThemeColors }
> = {
  default: {
    light: {
      primary: "#667eea",
      primaryLight: "#8b9ff5",
      primaryDark: "#5568d3",

      secondary: "#764ba2",
      secondaryLight: "#9b6ec7",
      secondaryDark: "#5c3a7f",

      background: "#ffffff",
      backgroundSecondary: "#f8f9fa",
      backgroundTertiary: "#e9ecef",

      surface: "#ffffff",
      surfaceHover: "#f8f9ff",

      textPrimary: "#212529",
      textSecondary: "#6c757d",
      textTertiary: "#adb5bd",
      textDisabled: "#dee2e6",

      border: "#dee2e6",
      borderLight: "#e9ecef",
      borderHover: "#667eea",

      success: "#28a745",
      successLight: "#d4edda",
      warning: "#ffc107",
      warningLight: "#fff3cd",
      error: "#dc3545",
      errorLight: "#f8d7da",
      info: "#17a2b8",
      infoLight: "#d1ecf1",

      shadow: "rgba(0, 0, 0, 0.1)",
      overlay: "rgba(0, 0, 0, 0.5)",
    },
    dark: {
      primary: "hsla(230, 84%, 75%, 1.00)",
      primaryLight: "#a8b8f7",
      primaryDark: "#667eea",

      secondary: "#9b6ec7",
      secondaryLight: "#b490d6",
      secondaryDark: "#764ba2",

      background: "hsla(240, 30%, 15%, 1.00)",
      backgroundSecondary: "hsla(225, 50%, 20%, 1.00)",
      backgroundTertiary: "hsla(220, 40%, 10%, 1.00)",

      surface: "hsla(235, 32%, 21%, 1.00)",
      surfaceHover: "hsla(234, 30%, 25%, 1.00)",

      textPrimary: "hsla(210, 15%, 95%, 1.00)",
      textSecondary: "#adb5bd",
      textTertiary: "#6c757d",
      textDisabled: "#495057",

      border: "#495057",
      borderLight: "#343a40",
      borderHover: "#8b9ff5",

      success: "#3dd268",
      successLight: "#1e4d2b",
      warning: "#ffc107",
      warningLight: "#4d3d0f",
      error: "#f85149",
      errorLight: "#4d1f1c",
      info: "#58a6ff",
      infoLight: "#1f3a52",

      shadow: "rgba(0, 0, 0, 0.3)",
      overlay: "rgba(0, 0, 0, 0.7)",
    },
  },

  ocean: {
    light: {
      primary: "#0077b6",
      primaryLight: "#0096c7",
      primaryDark: "#023e8a",

      secondary: "#00b4d8",
      secondaryLight: "#48cae4",
      secondaryDark: "#0096c7",

      background: "#ffffff",
      backgroundSecondary: "#f0f9ff",
      backgroundTertiary: "#e0f2fe",

      surface: "#ffffff",
      surfaceHover: "#f0f9ff",

      textPrimary: "#1e293b",
      textSecondary: "#475569",
      textTertiary: "#94a3b8",
      textDisabled: "#cbd5e1",

      border: "#cbd5e1",
      borderLight: "#e2e8f0",
      borderHover: "#0077b6",

      success: "#10b981",
      successLight: "#d1fae5",
      warning: "#f59e0b",
      warningLight: "#fef3c7",
      error: "#ef4444",
      errorLight: "#fee2e2",
      info: "#3b82f6",
      infoLight: "#dbeafe",

      shadow: "rgba(0, 119, 182, 0.1)",
      overlay: "rgba(0, 119, 182, 0.5)",
    },
    dark: {
      primary: "#0096c7",
      primaryLight: "#48cae4",
      primaryDark: "#0077b6",

      secondary: "#48cae4",
      secondaryLight: "#90e0ef",
      secondaryDark: "#00b4d8",

      background: "#0a1929",
      backgroundSecondary: "#0f2744",
      backgroundTertiary: "#071522",

      surface: "#1e3a5f",
      surfaceHover: "#2a4a6f",

      textPrimary: "#f0f9ff",
      textSecondary: "#bae6fd",
      textTertiary: "#7dd3fc",
      textDisabled: "#475569",

      border: "#334155",
      borderLight: "#1e293b",
      borderHover: "#0096c7",

      success: "#34d399",
      successLight: "#064e3b",
      warning: "#fbbf24",
      warningLight: "#451a03",
      error: "#f87171",
      errorLight: "#450a0a",
      info: "#60a5fa",
      infoLight: "#1e3a8a",

      shadow: "rgba(0, 150, 199, 0.2)",
      overlay: "rgba(0, 150, 199, 0.6)",
    },
  },

  forest: {
    light: {
      primary: "#2d6a4f",
      primaryLight: "#40916c",
      primaryDark: "#1b4332",

      secondary: "#52b788",
      secondaryLight: "#74c69d",
      secondaryDark: "#40916c",

      background: "#ffffff",
      backgroundSecondary: "#f7fdf9",
      backgroundTertiary: "#e8f5ee",

      surface: "#ffffff",
      surfaceHover: "#f1faee",

      textPrimary: "#1b4332",
      textSecondary: "#2d6a4f",
      textTertiary: "#52b788",
      textDisabled: "#b7e4c7",

      border: "#95d5b2",
      borderLight: "#d8f3dc",
      borderHover: "#2d6a4f",

      success: "#2d6a4f",
      successLight: "#d8f3dc",
      warning: "#fb8500",
      warningLight: "#ffedd5",
      error: "#e63946",
      errorLight: "#fecaca",
      info: "#219ebc",
      infoLight: "#cff4fc",

      shadow: "rgba(45, 106, 79, 0.1)",
      overlay: "rgba(27, 67, 50, 0.5)",
    },
    dark: {
      // ACCIONES PRINCIPALES (Botones, Links, Logos)
      primary: "#4A8A6D", // Tu verde original (Base)
      primaryLight: "#7FC09E", // Hover states (Más claro)
      primaryDark: "#40916c", // Active/Pressed states (Más oscuro)
      // onPrimary: "#081c15", // IMPORTANTE: Color de texto DENTRO del botón primario (Oscuro para contraste)

      // ACCIONES SECUNDARIAS
      secondary: "#b7e4c7", // Un verde menta pálido para elementos menos importantes
      secondaryLight: "#d8f3dc",
      secondaryDark: "#74c69d",

      // FONDOS (La base de tu UI)
      background: "#081c15", // Fondo general de la pantalla (Tu original)
      backgroundSecondary: "#0d281e", // Un poco más claro, para barras laterales o headers

      // SUPERFICIES (Tarjetas, Contenedores de botones, Modales)
      surface: "#1b4332", // Oscurecido para que el botón Primary destaque encima
      surfaceHover: "#2d6a4f", // Al pasar el mouse por una tarjeta
      border: "#2d6a4f", // Bordes sutiles para definir espacios

      // TEXTOS (Jerarquía de lectura)
      textPrimary: "#f0fdf4", // Casi blanco, máxima legibilidad
      textSecondary: "#a5d6bb", // Verde grisáceo, fácil de leer pero menos llamativo
      textTertiary: "#52b788", // Para etiquetas pequeñas o iconos decorativos
      textDisabled: "#2d6a4f", // Texto inhabilitado

      // ESTADOS (Feedback al usuario)
      success: "#4ade80", // Un verde neón más vibrante para "Éxito"
      warning: "#fb8500", // Naranja (Mantenido)
      error: "#ef233c", // Rojo (Mantenido)
      info: "#38bdf8", // Azul cielo (Mejor contraste que tu original)

      // EXTRAS
      overlay: "rgba(8, 28, 21, 0.85)", // Fondo oscuro para modales
      shadow: "0 4px 6px -1px rgba(82, 183, 136, 0.15)",
      backgroundTertiary: "",
      borderLight: "",
      borderHover: "",
      successLight: "",
      warningLight: "",
      errorLight: "",
      infoLight: "",
    },
  },

  sunset: {
    light: {
      primary: "#f77f00",
      primaryLight: "#fb9b31",
      primaryDark: "#d35400",

      secondary: "#d62828",
      secondaryLight: "#e63946",
      secondaryDark: "#9d0208",

      background: "#ffffff",
      backgroundSecondary: "#fffaf5",
      backgroundTertiary: "#fff3e6",

      surface: "#ffffff",
      surfaceHover: "#fff8f0",

      textPrimary: "#370617",
      textSecondary: "#6a040f",
      textTertiary: "#9d0208",
      textDisabled: "#ffb4a2",

      border: "#ffd9cc",
      borderLight: "#ffe6de",
      borderHover: "#f77f00",

      success: "#06d6a0",
      successLight: "#d4f4e8",
      warning: "#f77f00",
      warningLight: "#ffe6cc",
      error: "#d62828",
      errorLight: "#ffd9d9",
      info: "#118ab2",
      infoLight: "#d4e9f0",

      shadow: "rgba(247, 127, 0, 0.15)",
      overlay: "rgba(55, 6, 23, 0.5)",
    },
    dark: {
      primary: "#fb9b31",
      primaryLight: "#ffb454",
      primaryDark: "#f77f00",

      secondary: "#e63946",
      secondaryLight: "#ff6b77",
      secondaryDark: "#d62828",

      background: "#1a0a0a",
      backgroundSecondary: "#370617",
      backgroundTertiary: "#0f0404",

      surface: "#6a040f",
      surfaceHover: "#9d0208",

      textPrimary: "#fff5f5",
      textSecondary: "#ffb4a2",
      textTertiary: "#e5989b",
      textDisabled: "#9d0208",

      border: "#9d0208",
      borderLight: "#6a040f",
      borderHover: "#fb9b31",

      success: "#06d6a0",
      successLight: "#023436",
      warning: "#fb9b31",
      warningLight: "#3d2300",
      error: "#ff6b77",
      errorLight: "#4a0e0e",
      info: "#118ab2",
      infoLight: "#023047",

      shadow: "rgba(251, 155, 49, 0.2)",
      overlay: "rgba(26, 10, 10, 0.8)",
    },
  },

  midnight: {
    light: {
      primary: "#4361ee",
      primaryLight: "#5a7bff",
      primaryDark: "#3a52cc",

      secondary: "#7209b7",
      secondaryLight: "#9d4edd",
      secondaryDark: "#560bad",

      background: "#ffffff",
      backgroundSecondary: "#f8f9fe",
      backgroundTertiary: "#e9ecf8",

      surface: "#ffffff",
      surfaceHover: "#f0f2ff",

      textPrimary: "#0d0d0d",
      textSecondary: "#4a4a4a",
      textTertiary: "#7a7a7a",
      textDisabled: "#c4c4c4",

      border: "#d4d4d4",
      borderLight: "#e4e4e4",
      borderHover: "#4361ee",

      success: "#06d6a0",
      successLight: "#d4f4e8",
      warning: "#ffbe0b",
      warningLight: "#fff4cc",
      error: "#e63946",
      errorLight: "#ffd9d9",
      info: "#3a86ff",
      infoLight: "#d9e8ff",

      shadow: "rgba(67, 97, 238, 0.15)",
      overlay: "rgba(13, 13, 13, 0.5)",
    },
    dark: {
      primary: "#5a7bff",
      primaryLight: "#7c9aff",
      primaryDark: "#4361ee",

      secondary: "#9d4edd",
      secondaryLight: "#b67eea",
      secondaryDark: "#7209b7",

      background: "#0b0b0f",
      backgroundSecondary: "#1a1a2e",
      backgroundTertiary: "#05050a",

      surface: "#2b2d42",
      surfaceHover: "#3d405b",

      textPrimary: "#f8f9fe",
      textSecondary: "#c8cce5",
      textTertiary: "#9896c4",
      textDisabled: "#4a4a5e",

      border: "#3d405b",
      borderLight: "#2b2d42",
      borderHover: "#5a7bff",

      success: "#06d6a0",
      successLight: "#023436",
      warning: "#ffbe0b",
      warningLight: "#3d3000",
      error: "#ff6b77",
      errorLight: "#4a0e0e",
      info: "#3a86ff",
      infoLight: "#0a1f4d",

      shadow: "rgba(90, 123, 255, 0.2)",
      overlay: "rgba(11, 11, 15, 0.8)",
    },
  },

  custom: {
    light: {
      primary: "#667eea",
      primaryLight: "#8b9ff5",
      primaryDark: "#5568d3",
      secondary: "#764ba2",
      secondaryLight: "#9b6ec7",
      secondaryDark: "#5c3a7f",
      background: "#ffffff",
      backgroundSecondary: "#f8f9fa",
      backgroundTertiary: "#e9ecef",
      surface: "#ffffff",
      surfaceHover: "#f8f9ff",
      textPrimary: "#212529",
      textSecondary: "#6c757d",
      textTertiary: "#adb5bd",
      textDisabled: "#dee2e6",
      border: "#dee2e6",
      borderLight: "#e9ecef",
      borderHover: "#667eea",
      success: "#28a745",
      successLight: "#d4edda",
      warning: "#ffc107",
      warningLight: "#fff3cd",
      error: "#dc3545",
      errorLight: "#f8d7da",
      info: "#17a2b8",
      infoLight: "#d1ecf1",
      shadow: "rgba(0, 0, 0, 0.1)",
      overlay: "rgba(0, 0, 0, 0.5)",
    },
    dark: {
      primary: "#8b9ff5",
      primaryLight: "#a8b8f7",
      primaryDark: "#667eea",
      secondary: "#9b6ec7",
      secondaryLight: "#b490d6",
      secondaryDark: "#764ba2",
      background: "#1a1a2e",
      backgroundSecondary: "#16213e",
      backgroundTertiary: "#0f1624",
      surface: "#252847",
      surfaceHover: "#2d3154",
      textPrimary: "#f8f9fa",
      textSecondary: "#adb5bd",
      textTertiary: "#6c757d",
      textDisabled: "#495057",
      border: "#495057",
      borderLight: "#343a40",
      borderHover: "#8b9ff5",
      success: "#3dd268",
      successLight: "#1e4d2b",
      warning: "#ffc107",
      warningLight: "#4d3d0f",
      error: "#f85149",
      errorLight: "#4d1f1c",
      info: "#58a6ff",
      infoLight: "#1f3a52",
      shadow: "rgba(0, 0, 0, 0.3)",
      overlay: "rgba(0, 0, 0, 0.7)",
    },
  },
};
