import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Icon from "#shared/ui/atoms/icons";
export default function ChoiceCard({ icon, title, description, selected, onSelect, }) {
    return (_jsxs("button", { type: "button", className: "onboarding__choice" + (selected ? " onboarding__choice--selected" : ""), "aria-pressed": selected, onClick: onSelect, children: [_jsx("span", { className: "onboarding__choice-icon", "aria-hidden": "true", children: _jsx(Icon, { name: icon, size: 26 }) }), _jsxs("span", { className: "onboarding__choice-text", children: [_jsx("span", { className: "onboarding__choice-title", children: title }), description && (_jsx("span", { className: "onboarding__choice-description", children: description }))] }), selected && (_jsx("span", { className: "onboarding__choice-check", "aria-hidden": "true", children: _jsx(Icon, { name: "IconCheck", size: 18 }) }))] }));
}
