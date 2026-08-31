import { jsx as _jsx } from "react/jsx-runtime";
import "./divider.css";
export function DropdownDivider({ label }) {
    if (label) {
        return (_jsx("div", { className: "dropdown__divider dropdown__divider--with-label", children: _jsx("span", { className: "dropdown__divider-label", children: label }) }));
    }
    return _jsx("div", { className: "dropdown__divider", role: "separator" });
}
