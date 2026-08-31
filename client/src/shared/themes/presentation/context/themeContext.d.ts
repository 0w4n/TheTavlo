import type { FirebaseThemeRepository } from "../../infraestructure/themeRepository.firebase.ts";
import type { ThemeColors, ThemeConfig, ThemeMode, ThemePreset } from "../../domain/theme.entity.js";
import { type PropsWithChildren } from "react";
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
export declare const ThemeContext: import("react").Context<ThemeContextValue | undefined>;
export declare function ThemeProvider({ children, themeRepository, }: PropsWithChildren<{
    themeRepository: FirebaseThemeRepository;
}>): import("react").JSX.Element;
export {};
