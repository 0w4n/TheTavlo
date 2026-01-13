import { ThemeRules } from "#shared/themes/domain/theme.rules";
import type { FirebaseThemeRepository } from "../../infraestructure/themeRepository.firebase.ts";
import type {
  ThemeColors,
  ThemeConfig,
  ThemeMode,
  ThemePreset,
} from "../../domain/theme.entity.js";
import {
  createContext,
  useState,
  useEffect,
  type PropsWithChildren,
  useMemo,
} from "react";
import { Timestamp } from "firebase/firestore";

type ThemeContextValue = {
  config: ThemeConfig;
  colors: ThemeColors;
  isDark: boolean;
  setMode: (mode: ThemeMode) => Promise<void>;
  setPreset: (preset: ThemePreset) => Promise<void>;
  setCustomColor: (key: keyof ThemeColors, value: string) => Promise<void>;
  setFontSize: (size: ThemeConfig["fontSize"]) => Promise<void>;
  setBorderRadius: (radius: ThemeConfig["borderRadius"]) => Promise<void>;
  toggleAnimations: () => Promise<void>;
  resetTheme: () => Promise<void>;
};

export const ThemeContext = createContext<ThemeContextValue | null>(null);

const DEFAULT_THEME_CONFIG: Omit<ThemeConfig, "id" | "userId"> = {
  mode: "system",
  preset: "default",
  fontSize: "medium",
  borderRadius: "rounded",
  animations: true,
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now(),
};

export function ThemeProvider({
  children,
  themeRepository,
}: PropsWithChildren<{
  themeRepository: FirebaseThemeRepository;
}>) {
  const [config, setConfig] = useState<ThemeConfig>({
    ...DEFAULT_THEME_CONFIG,
    id: "temp",
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });

  const [loading, setLoading] = useState(true);

  // Cargar tema guardado
  useEffect(() => {
    loadTheme();
  }, []);

  // Escuchar cambios de sistema (para modo auto)
  useEffect(() => {
    if (config.mode !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      setConfig((prev) => ({ ...prev, updatedAt: Timestamp.now() }));
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, [config.mode]);

  const loadTheme = async () => {
    try {
      const saved = await themeRepository.getThemeConfig();
      if (saved) {
        setConfig(saved);
      } else {
        // Guardar tema por defecto
        const newConfig = await themeRepository.saveThemeConfig(
          DEFAULT_THEME_CONFIG
        );
        setConfig(newConfig);
      }
    } catch (error) {
      console.error("Error loading theme:", error);
    } finally {
      setLoading(false);
    }
  };

  const colors = useMemo(() => ThemeRules.getColors(config), [config]);
  const isDark = useMemo(
    () => ThemeRules.getEffectiveMode(config.mode) === "dark",
    [config.mode]
  );

  const setMode = async (mode: ThemeMode) => {
    const updated = await themeRepository.updateThemeConfig({ mode });
    setConfig(updated);
  };

  const setPreset = async (preset: ThemePreset) => {
    const updated = await themeRepository.updateThemeConfig({
      preset,
      customColors: preset === "custom" ? config.customColors : null,
    });
    setConfig(updated);
  };

  const setCustomColor = async (key: keyof ThemeColors, value: string) => {
    if (!ThemeRules.validateColor(value)) {
      throw new Error("Color inválido");
    }

    const updated = await themeRepository.updateThemeConfig({
      preset: "custom",
      customColors: {
        ...config.customColors,
        [key]: value,
      },
    });
    setConfig(updated);
  };

  const setFontSize = async (fontSize: ThemeConfig["fontSize"]) => {
    const updated = await themeRepository.updateThemeConfig({ fontSize });
    setConfig(updated);
  };

  const setBorderRadius = async (borderRadius: ThemeConfig["borderRadius"]) => {
    const updated = await themeRepository.updateThemeConfig({ borderRadius });
    setConfig(updated);
  };

  const toggleAnimations = async () => {
    const updated = await themeRepository.updateThemeConfig({
      animations: !config.animations,
    });
    setConfig(updated);
  };

  const resetTheme = async () => {
    const updated = await themeRepository.saveThemeConfig(DEFAULT_THEME_CONFIG);
    setConfig(updated);
  };

  // Aplicar CSS variables
  useEffect(() => {
    const root = document.documentElement;

    // Aplicar colores
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });

    // Aplicar font size
    const scale = ThemeRules.getFontSizeScale(config.fontSize);
    root.style.setProperty("--font-scale", scale.toString());

    // Aplicar border radius
    const radius = ThemeRules.getBorderRadiusValue(config.borderRadius);
    root.style.setProperty("--border-radius", radius);

    // Aplicar animaciones
    root.style.setProperty(
      "--transition-speed",
      config.animations ? "200ms" : "0ms"
    );

    // Clase para dark mode
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [colors, config, isDark]);

  if (loading) {
    return <div>Cargando tema...</div>;
  }

  const value: ThemeContextValue = {
    config,
    colors,
    isDark,
    setMode,
    setPreset,
    setCustomColor,
    setFontSize,
    setBorderRadius,
    toggleAnimations,
    resetTheme,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
