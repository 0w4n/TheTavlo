import type { ThemeColors, ThemeConfig, ThemeMode } from "./theme.entity";
export declare class ThemeRules {
    static getEffectiveMode(mode: ThemeMode): "light" | "dark";
    static getColors(config: ThemeConfig): ThemeColors;
    static validateColor(color: string): boolean;
    static getFontSizeScale(size: ThemeConfig["fontSize"]): number;
    static getBorderRadiusValue(radius: ThemeConfig["borderRadius"]): string;
}
