import { jsx as _jsx } from "react/jsx-runtime";
export default function GridOverlay({ cols = 12, rowHeight = 120, gap = 16, }) {
    return (_jsx("div", { className: "grid-overlay", style: {
            display: "grid",
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gridAutoRows: rowHeight,
            gap,
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            zIndex: 1,
        }, children: Array.from({ length: cols * 20 }).map((_, i) => (_jsx("div", { style: {
                border: "1px dashed rgba(102,126,234,0.25)",
                borderRadius: 4,
            } }, i))) }));
}
