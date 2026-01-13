import type { Timestamp } from "firebase/firestore";

export type ThemeMode = "light" | "dark" | "system";
export type ThemePreset =
  | "default"
  | "ocean"
  | "forest"
  | "sunset"
  | "midnight"
  | "custom";

export interface ThemeColors {
  // Primary colors
  primary: string;
  primaryLight: string;
  primaryDark: string;

  // Secondary colors
  secondary: string;
  secondaryLight: string;
  secondaryDark: string;

  // Background
  background: string;
  backgroundSecondary: string;
  backgroundTertiary: string;

  // Surface
  surface: string;
  surfaceHover: string;

  // Text
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textDisabled: string;

  // Border
  border: string;
  borderLight: string;
  borderHover: string;

  // Semantic colors
  success: string;
  successLight: string;
  warning: string;
  warningLight: string;
  error: string;
  errorLight: string;
  info: string;
  infoLight: string;

  // Special
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
export type UpdateThemeConfigDTO = Omit<
  Partial<CreateThemeConfigDTO>,
  "createdAt"
>;