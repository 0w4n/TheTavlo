import { jsx as _jsx } from "react/jsx-runtime";
import WidgetContent from "../content/WidgetContent";
export default function WidgetDragPreview({ widget }) {
    return (_jsx("div", { style: {
            width: 280,
            background: "var(--color-backgroundSecondary)",
            borderRadius: "12px",
            boxShadow: "0 12px 32px rgba(0,0,0,0.25)",
            overflow: "hidden",
            pointerEvents: "none",
        }, children: _jsx("div", { style: { padding: "1rem", maxHeight: 180, overflow: "hidden" }, children: _jsx(WidgetContent, { widget: widget, multiSelection: false }) }) }));
}
