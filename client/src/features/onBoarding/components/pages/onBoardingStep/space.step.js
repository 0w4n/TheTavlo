import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Input } from "#components/atoms/input";
import { suggestSpacePlaceholder, SPACE_NAME_MAX_LENGTH, SPACE_COLOR_OPTIONS, SPACE_ICON_OPTIONS } from "#features/onBoarding/domain/onBoarding.entity";
import Icon from "#shared/ui/atoms/icons";
// ─── Paso 2: personalizar el espacio ───────────────────────────────────────
export default function StepSpace({ goals, spaceName, onNameChange, nameError, spaceColor, onColorChange, spaceIcon, onIconChange, }) {
    return (_jsxs("section", { "aria-labelledby": "onboarding-heading", children: [_jsx("p", { className: "onboarding__eyebrow", children: "Tu espacio" }), _jsx("h1", { id: "onboarding-heading", className: "onboarding__title", children: "Ponele un nombre a tu espacio" }), _jsx("p", { className: "onboarding__subtitle", children: "Ya elegimos un color y un \u00EDcono por vos \u2014 tocalos solo si prefer\u00EDs otros. El nombre lo pod\u00E9s cambiar cuando quieras." }), _jsx("div", { className: "onboarding__field", children: _jsx(Input, { label: "Nombre del espacio", placeholder: suggestSpacePlaceholder(goals), value: spaceName, onChange: (event) => onNameChange(event.target.value), errorMessage: nameError ?? undefined, maxLength: SPACE_NAME_MAX_LENGTH, autoFocus: true, required: true }) }), _jsxs("fieldset", { className: "onboarding__subgroup", children: [_jsx("legend", { className: "onboarding__legend", children: "Color" }), _jsx("div", { className: "onboarding__swatches", children: SPACE_COLOR_OPTIONS.map((color) => (_jsx("button", { type: "button", className: "onboarding__swatch" +
                                (spaceColor === color.hue
                                    ? " onboarding__swatch--selected"
                                    : ""), style: { backgroundColor: `hsl(${color.hue}, 70%, 55%)` }, "aria-pressed": spaceColor === color.hue, "aria-label": color.name, onClick: () => onColorChange(color.hue) }, color.hue))) })] }), _jsxs("fieldset", { className: "onboarding__subgroup", children: [_jsx("legend", { className: "onboarding__legend", children: "\u00CDcono" }), _jsx("div", { className: "onboarding__icons", children: SPACE_ICON_OPTIONS.map((icon) => (_jsx("button", { type: "button", className: "onboarding__icon-btn" +
                                (spaceIcon === icon.name
                                    ? " onboarding__icon-btn--selected"
                                    : ""), "aria-pressed": spaceIcon === icon.name, "aria-label": icon.label, onClick: () => onIconChange(icon.name), children: _jsx(Icon, { name: icon.name, size: 22 }) }, icon.name))) })] })] }));
}
