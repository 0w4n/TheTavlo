import type { Timestamp } from "firebase/firestore";
export type ThemeMode = "light" | "dark" | "system";
export type ThemePreset = "default" | "ocean" | "forest" | "sunset" | "midnight" | "custom";
export interface ThemeColors {
    primary: string;
    primaryLight: string;
    primaryDark: string;
    secondary: string;
    secondaryLight: string;
    secondaryDark: string;
    background: string;
    backgroundSecondary: string;
    backgroundTertiary: string;
    surface: string;
    surfaceHover: string;
    textPrimary: string;
    textSecondary: string;
    textTertiary: string;
    textDisabled: string;
    border: string;
    borderLight: string;
    borderHover: string;
    success: string;
    successLight: string;
    warning: string;
    warningLight: string;
    error: string;
    errorLight: string;
    info: string;
    infoLight: string;
    shadow: string;
    overlay: string;
}
export interface ThemeConfig {
    id: string;
    mode: ThemeMode;
    preset: ThemePreset;
    customColors?: Partial<ThemeColors> | null;
    fontSize: "small" | "medium" | "large";
    borderRadius: "square" | "rounded" | "pill";
    animations: boolean;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}
export type CreateThemeConfigDTO = Omit<ThemeConfig, "id">;
export type UpdateThemeConfigDTO = Omit<Partial<CreateThemeConfigDTO>, "createdAt">;
