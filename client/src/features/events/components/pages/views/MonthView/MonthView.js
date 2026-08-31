import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import DayCard from "../../../templates/DayCard/DayCard";
import EventCard from "../../../templates/EventCard/EventCard";
import "./MonthView.css";
export default function MonthView(currentDate, events) {
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const startDate = new Date(firstDayOfMonth);
    const dayOfWeek = firstDayOfMonth.getDay();
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Monday = 0
    startDate.setDate(firstDayOfMonth.getDate() - daysToSubtract);
    const days = Array.from({ length: 35 }, (_, i) => {
        const day = new Date(startDate);
        day.setDate(startDate.getDate() + i);
        return day;
    });
    console.log(days);
    const weekDays = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
    return (_jsxs("div", { className: "month-view", children: [weekDays.map((day, index) => (_jsx("div", { className: "DateCard", children: _jsx("span", { className: "text-sm font-medium text-gray-600 dark:text-gray-400", children: day }) }, index))), days.map((d) => (_jsx(DayCard, { day: d, children: events
                    .filter((ev) => {
                    const startAt = "startAt" in ev ? ev.startAt.toDate() : null;
                    return startAt?.getDate() === d.getDate();
                })
                    .map((ev) => (_jsx(EventCard, { type: "month", event: ev, size: "small" }, ev.id))) }, d.toDateString())))] }));
}
