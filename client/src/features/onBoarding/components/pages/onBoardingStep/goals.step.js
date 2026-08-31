import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { GOAL_OPTIONS, } from "#features/onBoarding/domain/onBoarding.entity";
import ChoiceCard from "../../molecule/choiceCard/ChoiceCard";
// ─── Paso 1: objetivo ───────────────────────────────────────────────────────
export default function StepGoals({ goals, onToggle, }) {
    return (_jsxs("section", { "aria-labelledby": "onboarding-heading", children: [_jsx("p", { className: "onboarding__eyebrow", children: "Antes que nada" }), _jsx("h1", { id: "onboarding-heading", className: "onboarding__title", children: "\u00BFQu\u00E9 quer\u00E9s resolver con TheTavlo?" }), _jsx("p", { className: "onboarding__subtitle", children: "Eleg\u00ED una o m\u00E1s \u2014 as\u00ED armamos tu espacio para vos, no al rev\u00E9s." }), _jsx("div", { className: "onboarding__grid", role: "group", "aria-labelledby": "onboarding-heading", children: GOAL_OPTIONS.map((option) => (_jsx(ChoiceCard, { icon: option.icon, title: option.label, description: option.description, selected: goals.includes(option.value), onSelect: () => onToggle(option.value) }, option.value))) })] }));
}
