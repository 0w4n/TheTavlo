import { jsx as _jsx } from "react/jsx-runtime";
import useTheme from "#shared/themes/presentation/hooks/useTheme";
import Icon from "#shared/ui/atoms/icons";
export function ThemeToggleButton() {
    const { config, isDark, setMode } = useTheme();
    const toggleTheme = () => {
        if (config.mode === "system") {
            setMode(isDark ? "light" : "dark");
        }
        else {
            setMode(config.mode === "light" ? "dark" : "light");
        }
    };
    return (_jsx("button", { onClick: toggleTheme, title: "Cambiar tema", className: "secondary icon-only", children: _jsx(Icon, { name: "IconSunMoon" }) }));
}
