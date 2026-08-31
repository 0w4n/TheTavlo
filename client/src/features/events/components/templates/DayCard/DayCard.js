import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button } from "#components/atoms/button";
import "./DayCard.css";
export default function DayCard({ day, children, }) {
    const now = new Date();
    const format = new Intl.DateTimeFormat("es-ES", { month: "long" });
    const isToday = day.getMonth() === now.getMonth() && day.getDate() === now.getDate();
    const isCurrentMonth = day.getMonth() === now.getMonth();
    return (_jsxs("div", { className: `daycard ${isToday ? "today" : ""} ${isCurrentMonth ? "" : "not-current-month"}`, children: [_jsxs("div", { className: "daycard__header", children: [_jsx("span", { children: day.getDate() }), _jsx(Button, { variant: "ghost", size: "sm", type: "button", icon: "IconPlus", iconSize: 10, className: "daycard__header-addEvent" })] }), children ? _jsx("div", { className: "event-container", children: children }) : null, 1 == day.getDate() ? (_jsx("div", { className: "day-footer", children: _jsx("span", { children: format.format(day) }) })) : null] }));
}
