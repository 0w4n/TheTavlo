import useTheme from "#shared/themes/presentation/hooks/useTheme";
import Icon from "#shared/ui/atoms/icons";

export function ThemeToggleButton() {
  const { config, isDark, setMode } = useTheme();

  const toggleTheme = () => {
    if (config.mode === "system") {
      setMode(isDark ? "light" : "dark");
    } else {
      setMode(config.mode === "light" ? "dark" : "light");
    }
  };

  return (
    <button
      onClick={toggleTheme}
      title="Cambiar tema"
      className="secondary icon-only"
    >
      <Icon name="IconSunMoon" />
    </button>
  );
}
