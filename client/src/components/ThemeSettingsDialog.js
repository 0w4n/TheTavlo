import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import useTheme from "#shared/themes/presentation/hooks/useTheme";
import { THEME_PRESETS } from "#shared/themes/domain/theme.preset";
import Icon from "#shared/ui/atoms/icons";
import { Tooltip } from "react-tooltip";
import { Button } from "./atoms/button";
export function ThemeSettingsDialog({ onClose }) {
    const { resetTheme } = useTheme();
    const [activeTab, setActiveTab] = useState("preset");
    return (_jsx("div", { style: {
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "var(--color-overlay)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "1rem",
        }, children: _jsxs("div", { style: {
                background: "var(--color-surface)",
                borderRadius: "var(--border-radius)",
                padding: "2rem",
                maxWidth: "700px",
                width: "100%",
                maxHeight: "90vh",
                overflow: "auto",
                boxShadow: `0 20px 60px var(--color-shadow)`,
            }, children: [_jsxs("div", { style: {
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "1.5rem",
                    }, children: [_jsx("h2", { style: {
                                margin: 0,
                                color: "var(--color-textPrimary)",
                                fontSize: "1.5rem",
                            }, children: "\u2699\uFE0F Personalizaci\u00F3n" }), _jsx("em", { children: "Los cambios todav\u00EDa no se han guardado" }), _jsx("button", { onClick: onClose, style: {
                                background: "transparent",
                                border: "none",
                                fontSize: "1.5rem",
                                cursor: "pointer",
                                color: "var(--color-textSecondary)",
                            }, children: "\u00D7" })] }), _jsx("div", { style: {
                        display: "flex",
                        gap: "0.5rem",
                        marginBottom: "1.5rem",
                        borderBottom: `1px solid var(--color-border)`,
                    }, children: [
                        { key: "preset", label: "Temas", icon: "IconPalette" },
                        {
                            key: "customize",
                            label: "Personalizar",
                            icon: "IconBrush",
                        },
                        {
                            key: "accessibility",
                            label: "Accesibilidad",
                            icon: "IconAccesible",
                        },
                    ].map((tab) => (_jsxs("button", { onClick: () => setActiveTab(tab.key), style: {
                            padding: "0.75rem 1.25rem",
                            border: "none",
                            background: "transparent",
                            borderBottom: activeTab === tab.key
                                ? `3px solid var(--color-primary)`
                                : "3px solid transparent",
                            color: activeTab === tab.key
                                ? "var(--color-primary)"
                                : "var(--color-textSecondary)",
                            fontWeight: activeTab === tab.key ? "600" : "400",
                            cursor: "pointer",
                            fontSize: "0.95rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            transition: "all var(--transition-speed)",
                        }, children: [_jsx(Icon, { name: tab.icon, size: 16 }), tab.label] }, tab.key))) }), activeTab === "preset" && _jsx(PresetTab, {}), activeTab === "customize" && _jsx(CustomizeTab, {}), activeTab === "accessibility" && _jsx(AccessibilityTab, {}), _jsxs("div", { style: {
                        marginTop: "2rem",
                        paddingTop: "1rem",
                        borderTop: `1px solid var(--color-border)`,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }, children: [_jsx("button", { onClick: resetTheme, style: {
                                padding: "0.75rem 1.5rem",
                                border: `2px solid var(--color-border)`,
                                borderRadius: "var(--border-radius)",
                                background: "var(--color-background)",
                                color: "var(--color-textSecondary)",
                                cursor: "pointer",
                                fontWeight: "500",
                                transition: "all var(--transition-speed)",
                            }, children: "Restaurar por Defecto" }), _jsx("button", { onClick: onClose, style: {
                                padding: "0.75rem 2rem",
                                border: "none",
                                borderRadius: "var(--border-radius)",
                                background: "var(--color-primary)",
                                color: "white",
                                cursor: "pointer",
                                fontWeight: "600",
                                transition: "all var(--transition-speed)",
                            }, children: "Guardar y Cerrar" })] })] }) }));
}
function PresetTab() {
    const { setMode, setPreset } = useTheme();
    const modes = [
        {
            key: "light",
            label: "Claro",
            icon: "IconSun",
        },
        {
            key: "dark",
            label: "Oscuro",
            icon: "IconMoon",
        },
        { key: "system", label: "Segun sistema", icon: "IconSunMoon" },
    ];
    const presets = [
        { key: "default", label: "Por Defecto" },
        { key: "ocean", label: "Océano" },
        { key: "forest", label: "Bosque" },
        { key: "sunset", label: "Atardecer" },
        { key: "midnight", label: "Medianoche" },
    ];
    return (_jsxs("div", { children: [_jsxs("div", { style: { marginBottom: "2rem" }, children: [_jsx("h3", { style: {
                            margin: "0 0 1rem 0",
                            fontSize: "1.1rem",
                            color: "var(--color-textPrimary)",
                        }, children: "Modo de Tema" }), _jsx("div", { style: {
                            display: "grid",
                            gridTemplateColumns: "repeat(3, 1fr)",
                            gap: "1rem",
                        }, children: modes.map((mode) => (_jsxs(Button, { onClick: () => setMode(mode.key), className: "secondary icon", "data-tooltip-id": "mode", "data-tooltip-content": mode.label, "data-tooltip-place": "bottom", children: [_jsx(Icon, { name: mode.icon }), _jsx(Tooltip, { id: "mode" })] }, mode.key))) })] }), _jsxs("div", { children: [_jsx("h3", { style: {
                            margin: "0 0 1rem 0",
                            fontSize: "1.1rem",
                            color: "var(--color-textPrimary)",
                        }, children: "Temas Predefinidos" }), _jsx("div", { style: {
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, 1fr)",
                            gap: "1rem",
                        }, children: presets.map((preset) => {
                            const presetColors = THEME_PRESETS[preset.key].light;
                            return (_jsxs("button", { onClick: () => setPreset(preset.key), className: "tertiary", children: [_jsxs("div", { style: {
                                            display: "flex",
                                            gap: "4px",
                                            justifyContent: "center",
                                        }, children: [_jsx("div", { style: {
                                                    width: "24px",
                                                    height: "24px",
                                                    borderRadius: "50%",
                                                    background: presetColors.primary,
                                                } }), _jsx("div", { style: {
                                                    width: "24px",
                                                    height: "24px",
                                                    borderRadius: "50%",
                                                    background: presetColors.secondary,
                                                } }), _jsx("div", { style: {
                                                    width: "24px",
                                                    height: "24px",
                                                    borderRadius: "50%",
                                                    background: presetColors.success,
                                                } })] }), _jsx("div", { style: {
                                            fontWeight: "600",
                                            fontSize: "0.75rem",
                                            color: "var(--color-textPrimary)",
                                        }, children: preset.label })] }, preset.key));
                        }) })] })] }));
}
function CustomizeTab() {
    const { colors, setCustomColor } = useTheme();
    const [editingColor, setEditingColor] = useState(undefined);
    const colorGroups = [
        {
            title: "Colores Principales",
            colors: [
                { key: "primary", label: "Primario" },
                { key: "primaryLight", label: "Primario Claro" },
                { key: "primaryDark", label: "Primario Oscuro" },
                { key: "secondary", label: "Secundario" },
                { key: "secondaryLight", label: "Secundario Claro" },
                { key: "secondaryDark", label: "Secundario Oscuro" },
            ],
        },
        {
            title: "Colores de Fondo",
            colors: [
                { key: "background", label: "Fondo Principal" },
                { key: "backgroundSecondary", label: "Fondo Secundario" },
                { key: "surface", label: "Superficie" },
            ],
        },
        {
            title: "Colores Semánticos",
            colors: [
                { key: "success", label: "Éxito" },
                { key: "warning", label: "Advertencia" },
                { key: "error", label: "Error" },
                { key: "info", label: "Información" },
            ],
        },
    ];
    const handleColorChange = async (key, value) => {
        try {
            await setCustomColor(key, value);
            setEditingColor(key);
        }
        catch {
            alert("Color inválido. Usa formato hexadecimal (ej: #667eea)");
        }
    };
    return (_jsxs("div", { children: [_jsxs("div", { style: {
                    padding: "1rem",
                    background: "var(--color-warningLight)",
                    border: `1px solid var(--color-warning)`,
                    borderRadius: "var(--border-radius)",
                    marginBottom: "1.5rem",
                    fontSize: "0.9rem",
                    color: "var(--color-textPrimary)",
                }, children: ["\uD83D\uDCA1 ", _jsx("strong", { children: "Nota:" }), " Personalizar colores cambiar\u00E1 autom\u00E1ticamente al tema \"Personalizado\""] }), colorGroups.map((group) => (_jsxs("div", { style: { marginBottom: "2rem" }, children: [_jsx("h3", { style: {
                            margin: "0 0 1rem 0",
                            fontSize: "1rem",
                            color: "var(--color-textPrimary)",
                        }, children: group.title }), _jsx("div", { style: {
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
                            gap: "1rem",
                        }, children: group.colors.map(({ key, label }) => {
                            const isActive = editingColor === key;
                            return (_jsxs("div", { style: {
                                    padding: "1rem",
                                    border: isActive
                                        ? "2px solid var(--color-primary)"
                                        : "1px solid var(--color-border)",
                                    borderRadius: "var(--border-radius)",
                                    background: isActive
                                        ? "var(--color-primaryLight)20"
                                        : "var(--color-background)",
                                    boxShadow: isActive
                                        ? "0 0 12px var(--color-primaryLight)"
                                        : "none",
                                    transition: "all 0.25s ease",
                                    transform: isActive ? "scale(1.02)" : "scale(1)",
                                }, children: [_jsx("div", { style: {
                                            width: "100%",
                                            height: "60px",
                                            borderRadius: "var(--border-radius)",
                                            background: colors[key],
                                            marginBottom: "0.75rem",
                                            border: `1px solid var(--color-border)`,
                                            transition: "all 0.25s ease",
                                        } }), _jsx("div", { style: {
                                            fontWeight: "600",
                                            marginBottom: "0.5rem",
                                            fontSize: "0.85rem",
                                            color: "var(--color-textPrimary)",
                                        }, children: label }), _jsx("input", { type: "text", value: colors[key], onChange: (e) => {
                                            if (e.target.value.length === 7) {
                                                handleColorChange(key, e.target.value);
                                            }
                                        }, placeholder: "#667eea", style: {
                                            width: "100%",
                                            padding: "0.5rem",
                                            border: `1px solid var(--color-border)`,
                                            borderRadius: "var(--border-radius)",
                                            fontSize: "0.8rem",
                                            fontFamily: "monospace",
                                            background: "var(--color-surface)",
                                            color: "var(--color-textPrimary)",
                                        } })] }, key));
                        }) })] }, group.title)))] }));
}
function AccessibilityTab() {
    const { config, setFontSize, setBorderRadius, toggleAnimations } = useTheme();
    return (_jsxs("div", { children: [_jsxs("div", { style: { marginBottom: "2rem" }, children: [_jsx("h3", { style: {
                            margin: "0 0 1rem 0",
                            fontSize: "1.1rem",
                            color: "var(--color-textPrimary)",
                        }, children: "Tama\u00F1o de Fuente" }), _jsx("div", { style: {
                            display: "grid",
                            gridTemplateColumns: "repeat(3, 1fr)",
                            gap: "1rem",
                        }, children: ["small", "medium", "large"].map((size) => (_jsxs("button", { onClick: () => setFontSize(size), style: {
                                padding: "1.5rem 1rem",
                                border: config.fontSize === size
                                    ? `2px solid var(--color-primary)`
                                    : `2px solid var(--color-border)`,
                                borderRadius: "var(--border-radius)",
                                background: config.fontSize === size
                                    ? "var(--color-primaryLight)20"
                                    : "var(--color-background)",
                                cursor: "pointer",
                                transition: "all var(--transition-speed)",
                            }, children: [_jsx("div", { style: {
                                        fontSize: size === "small"
                                            ? "0.875rem"
                                            : size === "large"
                                                ? "1.125rem"
                                                : "1rem",
                                        fontWeight: "600",
                                        color: "var(--color-textPrimary)",
                                    }, children: "Aa" }), _jsx("div", { style: {
                                        fontSize: "0.75rem",
                                        color: "var(--color-textSecondary)",
                                        marginTop: "0.5rem",
                                        textTransform: "capitalize",
                                    }, children: size === "small"
                                        ? "Pequeño"
                                        : size === "large"
                                            ? "Grande"
                                            : "Mediano" })] }, size))) })] }), _jsxs("div", { style: { marginBottom: "2rem" }, children: [_jsx("h3", { style: {
                            margin: "0 0 1rem 0",
                            fontSize: "1.1rem",
                            color: "var(--color-textPrimary)",
                        }, children: "Bordes" }), _jsx("div", { style: {
                            display: "grid",
                            gridTemplateColumns: "repeat(3, 1fr)",
                            gap: "1rem",
                        }, children: ["square", "rounded", "pill"].map((radius) => (_jsxs("button", { onClick: () => setBorderRadius(radius), style: {
                                padding: "1rem",
                                border: config.borderRadius === radius
                                    ? `2px solid var(--color-primary)`
                                    : `2px solid var(--color-border)`,
                                borderRadius: radius === "square"
                                    ? "0px"
                                    : radius === "rounded"
                                        ? "8px"
                                        : "999px",
                                background: config.borderRadius === radius
                                    ? "var(--color-primaryLight)20"
                                    : "var(--color-background)",
                                cursor: "pointer",
                                transition: "all var(--transition-speed)",
                            }, children: [_jsx("div", { style: {
                                        width: "60px",
                                        height: "40px",
                                        background: "var(--color-primary)",
                                        borderRadius: radius === "square"
                                            ? "0px"
                                            : radius === "rounded"
                                                ? "8px"
                                                : "999px",
                                        margin: "0 auto 0.75rem",
                                    } }), _jsx("div", { style: {
                                        fontSize: "0.85rem",
                                        color: "var(--color-textPrimary)",
                                        fontWeight: "600",
                                        textTransform: "capitalize",
                                    }, children: radius === "square"
                                        ? "Cuadrado"
                                        : radius === "rounded"
                                            ? "Redondeado"
                                            : "Píldora" })] }, radius))) })] }), _jsxs("div", { children: [_jsx("h3", { style: {
                            margin: "0 0 1rem 0",
                            fontSize: "1.1rem",
                            color: "var(--color-textPrimary)",
                        }, children: "Animaciones" }), _jsxs("div", { onClick: toggleAnimations, style: {
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "1.25rem",
                            border: `1px solid var(--color-border)`,
                            borderRadius: "var(--border-radius)",
                            background: "var(--color-background)",
                            cursor: "pointer",
                        }, children: [_jsxs("div", { children: [_jsx("div", { style: {
                                            fontWeight: "600",
                                            marginBottom: "0.25rem",
                                            color: "var(--color-textPrimary)",
                                        }, children: "Reducir movimiento" }), _jsx("div", { style: {
                                            fontSize: "0.85rem",
                                            color: "var(--color-textSecondary)",
                                        }, children: "Desactiva las transiciones y animaciones" })] }), _jsx("div", { style: {
                                    width: "50px",
                                    height: "28px",
                                    borderRadius: "14px",
                                    background: config.animations
                                        ? "var(--color-primary)"
                                        : "var(--color-border)",
                                    position: "relative",
                                    transition: "background 0.3s",
                                }, children: _jsx("div", { style: {
                                        width: "22px",
                                        height: "22px",
                                        borderRadius: "50%",
                                        background: "white",
                                        position: "absolute",
                                        top: "3px",
                                        left: config.animations ? "25px" : "3px",
                                        transition: "left 0.3s",
                                    } }) })] })] })] }));
}
