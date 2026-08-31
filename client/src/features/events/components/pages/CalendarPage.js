import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useState } from "react";
import EventCard from "../templates/EventCard/EventCard";
import MonthView from "./views/MonthView/MonthView";
import { Button } from "#components/atoms/button";
import "./CalendarPage.css";
const hours = Array.from({ length: 24 }, (_, i) => i);
export default function CalendarPage({ events, initialView = "month", initialDate = new Date(), }) {
    const [view, setView] = useState(initialView);
    const [currentDate, setCurrentDate] = useState(initialDate);
    const now = new Date();
    const currentHour = now.getHours();
    const goPrev = () => {
        const newDate = new Date(currentDate);
        if (view === "month")
            newDate.setMonth(newDate.getMonth() - 1);
        if (view === "week")
            newDate.setDate(newDate.getDate() - 7);
        if (view === "day")
            newDate.setDate(newDate.getDate() - 1);
        setCurrentDate(newDate);
    };
    const goNext = () => {
        const newDate = new Date(currentDate);
        if (view === "month")
            newDate.setMonth(newDate.getMonth() + 1);
        if (view === "week")
            newDate.setDate(newDate.getDate() + 7);
        if (view === "day")
            newDate.setDate(newDate.getDate() + 1);
        setCurrentDate(newDate);
    };
    const renderEventsForDay = (date) => {
        const dayEvents = events.filter((ev) => {
            const startAt = "startAt" in ev ? ev.startAt.toDate() : null;
            const endAt = "endAt" in ev ? ev.endAt.toDate() : null;
            return (startAt?.toDateString() === date.toDateString() ||
                (startAt && endAt && startAt <= date && endAt >= date));
        });
        return (_jsx("div", { className: "day-view", children: hours.map((hour) => {
                const hourEvents = dayEvents.filter((ev) => {
                    const startAt = "startAt" in ev ? ev.startAt.toDate() : null;
                    return startAt?.getHours() === hour;
                });
                const isCurrentHour = date.toDateString() === now.toDateString() && hour === currentHour;
                return (_jsxs("div", { className: `hour-slot ${isCurrentHour ? "current-hour" : ""}`, children: [_jsxs("div", { className: "hour-label", children: [hour, ":00"] }), _jsx("div", { className: "hour-events", children: hourEvents.map((ev) => {
                                // const duration =
                                //   (ev.end.toDate().getTime() - ev.start.toDate().getTime()) /
                                //   (1000 * 60 * 60);
                                return (_jsx(EventCard, { type: "day", event: ev, size: "large", className: isCurrentHour ? "current-event" : "" }, ev.id));
                            }) })] }, hour));
            }) }));
    };
    const formatDayLabel = (date) => {
        const day = date.getDate();
        const weekday = date
            .toLocaleDateString("es-ES", { weekday: "short" })
            .replace(".", "");
        const month = date
            .toLocaleDateString("es-ES", { month: "short" })
            .replace(".", "");
        return `${weekday}/${day}/${month}`;
    };
    const renderWeek = (date) => {
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay());
        const days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date(startOfWeek);
            d.setDate(startOfWeek.getDate() + i);
            return d;
        });
        return (_jsxs("div", { className: "week-view-grid", children: [_jsxs("div", { className: "week-header", children: [_jsx("div", { className: "hour-label" }), days.map((d) => (_jsx("div", { className: "week-day-header", children: formatDayLabel(d) }, d.toDateString())))] }), hours.map((hour) => {
                    const isCurrentHour = now.getDay() !== -1 && hour === currentHour; // Highlight current hour
                    return (_jsxs("div", { className: `week-hour-row ${isCurrentHour ? "current-hour" : ""}`, children: [_jsxs("div", { className: "hour-label", children: [hour, ":00"] }), days.map((d) => {
                                const dayEvents = events.filter((ev) => {
                                    const startAt = "startAt" in ev ? ev.startAt.toDate() : null;
                                    return startAt?.getDate() === d.getDate();
                                });
                                const hourEvents = dayEvents.filter((ev) => {
                                    const startAt = "startAt" in ev ? ev.startAt.toDate() : null;
                                    return startAt?.getHours() === hour;
                                });
                                return (_jsx("div", { className: "week-hour-slot", children: hourEvents.map((ev) => (_jsx(EventCard, { type: "week", size: "small", className: isCurrentHour ? "current-event" : "", event: ev }, ev.id))) }, d.toDateString()));
                            })] }, hour));
                })] }));
    };
    return (_jsxs("div", { className: "calendar", children: [_jsxs("div", { className: "calendar__header", children: [_jsxs("div", { className: "calendar__header--navigation", children: [_jsx(Button, { variant: "primary", icon: "IconChevronLeft", iconSize: 18, onClick: goPrev }), _jsx("h2", { children: currentDate.toLocaleDateString("es-ES", {
                                    month: "long",
                                    year: "numeric",
                                    day: view === "day" ? "numeric" : undefined,
                                }) }), _jsx(Button, { variant: "primary", icon: "IconChevronRight", iconSize: 18, onClick: goNext })] }), _jsxs("div", { className: "calendar__header--view-selector", children: [_jsx(Button, { variant: "secondary", icon: "IconCalendar", iconSize: 20, onClick: () => setView("day") }), _jsx(Button, { variant: "secondary", icon: "IconCalendarWeek", iconSize: 20, onClick: () => setView("week") }), _jsx(Button, { variant: "secondary", icon: "IconCalendarMonth", iconSize: 20, onClick: () => setView("month") })] })] }), view === "day" && renderEventsForDay(currentDate), view === "week" && renderWeek(currentDate), view === "month" && MonthView(currentDate, events)] }));
}
