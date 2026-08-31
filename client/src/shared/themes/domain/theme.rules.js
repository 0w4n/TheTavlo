import { THEME_PRESETS } from "./theme.preset";
export class ThemeRules {
    static getEffectiveMode(mode) {
        if (mode === "system") {
            return window.matchMedia("(prefers-color-scheme: dark)").matches
                ? "dark"
                : "light";
        }
        return mode;
    }
    static getColors(config) {
        const effectiveMode = this.getEffectiveMode(config.mode);
        const presetColors = THEME_PRESETS[config.preset][effectiveMode];
        // Si es custom y tiene customColors, mergear
        if (config.preset === "custom" && config.customColors) {
            return { ...presetColors, ...config.customColors };
        }
        return presetColors;
    }
    static validateColor(color) {
        const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
        return hexRegex.test(color);
    }
    static getFontSizeScale(size) {
        const scales = { small: 0.875, medium: 1, large: 1.125 };
        return scales[size];
    }
    static getBorderRadiusValue(radius) {
        const values = { square: "0px", rounded: "8px", pill: "999px" };
        return values[radius];
    }
}
