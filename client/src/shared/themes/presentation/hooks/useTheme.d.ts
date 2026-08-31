export default function useTheme(): {
    config: import("../../domain/theme.entity").ThemeConfig;
    colors: import("../../domain/theme.entity").ThemeColors;
    isDark: boolean;
    setMode: (mode: import("../../domain/theme.entity").ThemeMode) => Promise<void>;
    setPreset: (preset: import("../../domain/theme.entity").ThemePreset) => Promise<void>;
    setCustomColor: (key: keyof import("../../domain/theme.entity").ThemeColors, value: string) => Promise<void>;
    setFontSize: (size: import("../../domain/theme.entity").ThemeConfig["fontSize"]) => Promise<void>;
    setBorderRadius: (radius: import("../../domain/theme.entity").ThemeConfig["borderRadius"]) => Promise<void>;
    toggleAnimations: () => Promise<void>;
    resetTheme: () => Promise<void>;
};
