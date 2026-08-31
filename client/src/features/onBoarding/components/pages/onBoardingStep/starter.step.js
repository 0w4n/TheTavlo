import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { STARTER_OPTIONS, } from "#features/onBoarding/domain/onBoarding.entity";
import ChoiceCard from "../../molecule/choiceCard/ChoiceCard";
// ─── Paso 3: punto de partida ───────────────────────────────────────────────
export default function StepStarter({ starter, onSelect, }) {
    return (_jsxs("section", { "aria-labelledby": "onboarding-heading", children: [_jsx("p", { className: "onboarding__eyebrow", children: "C\u00F3mo empezar" }), _jsx("h1", { id: "onboarding-heading", className: "onboarding__title", children: "\u00BFC\u00F3mo prefer\u00EDs ver tu espacio al entrar?" }), _jsx("p", { className: "onboarding__subtitle", children: "Vas a poder sumar m\u00E1s vistas despu\u00E9s \u2014 esto es solo el punto de partida." }), _jsx("div", { className: "onboarding__grid onboarding__grid--two", role: "group", "aria-labelledby": "onboarding-heading", children: STARTER_OPTIONS.map((option) => (_jsx(ChoiceCard, { icon: option.icon, title: option.label, description: option.description, selected: starter === option.value, onSelect: () => onSelect(option.value) }, option.value))) })] }));
}
