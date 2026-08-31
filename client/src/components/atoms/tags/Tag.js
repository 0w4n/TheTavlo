import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Icon from "#shared/ui/atoms/icons";
export default function Tag({ title, icon, color, checked }) {
    return (_jsxs("div", { className: "tag", style: { "backgroundColor": `hsl(${color}, 100%, 80%)` }, children: [_jsx(Icon, { name: icon, size: 8, color: `hsl(${color}, 100%, 80%)` }), _jsx("span", { className: "tag__title", children: title }), _jsx(Icon, { name: checked ? "IconCircleDashed" : "IconCircleCheck", size: 8, color: `hsl(${color}, 100%, 25%)` })] }));
}
