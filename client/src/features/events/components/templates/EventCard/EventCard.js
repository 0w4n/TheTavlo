import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Icon from "#shared/ui/atoms/icons";
import "./EventCard.css";
import { isExamEvent, isGenericEvent, isMeetingEvent, isOtherEvent, } from "#features/events/domain/events.entity";
export default function EventCard({ type, event, size = "medium", className, }) {
    const classes = `event__card ${type}-card ${size} ${className}`;
    if (isExamEvent(event)) {
        return (_jsxs("div", { className: classes, children: [_jsxs("div", { className: "event__card-header", children: [_jsx("p", { className: "event__card-title", children: event.name }), _jsx(Icon, { name: "IconCalendar", size: size === "small" ? 8 : size === "large" ? 16 : 12 })] }), _jsx("p", { className: "event__card-time", children: event.time })] }));
    }
    if (isGenericEvent(event)) {
        return (_jsxs("div", { className: classes, children: [_jsxs("div", { className: "event__card-header", children: [_jsx("p", { className: "event__card-title", children: event.name }), _jsx(Icon, { name: "IconCalendar", size: size === "small" ? 8 : size === "large" ? 16 : 12 })] }), event.description && type !== "month" && (_jsx("p", { className: "event__card-description", children: event.description }))] }));
    }
    if (isMeetingEvent(event)) {
        return (_jsxs("div", { className: classes, children: [_jsxs("div", { className: "event__card-header", children: [_jsx("p", { className: "event__card-title", children: event.name }), _jsx(Icon, { name: "IconCalendar", size: size === "small" ? 8 : size === "large" ? 16 : 12 })] }), _jsxs("div", { children: [_jsx("p", { children: event.location.type === "physical" ? event.location.address : "Virtual Meeting" }), event.participants?.map((p, i) => (_jsx("p", { children: p }, i)))] })] }));
    }
    if (isOtherEvent(event)) {
        return (_jsxs("div", { className: classes, children: [_jsxs("div", { className: "event__card-header", children: [_jsx("p", { className: "event__card-title", children: event.name }), _jsx(Icon, { name: "IconCalendar", size: size === "small" ? 8 : size === "large" ? 16 : 12 })] }), event.description && type !== "month" && (_jsx("p", { className: "event__card-description", children: event.description }))] }));
    }
}
