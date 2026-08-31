import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import Icon from "#shared/ui/atoms/icons";
import "./examsTimelineWidget.css";
import { useEvents } from "#features/events/presentation/hooks/useEvents";
import LoadingPage from "#components/pages/LoadingPage";
export default function ExamsTimelineWidget() {
    const { state } = useEvents();
    if (state.status === "loading") {
        return _jsx(LoadingPage, {});
    }
    else if (state.status === "events") {
        if (state.event.length === 0) {
            return _jsx("span", { children: "No hay nada" });
        }
        else {
            const items = state.event;
            return (_jsx(_Fragment, { children: items.map((item) => examTimelineItem({
                    examDate: item.makeAt,
                    id: item.id,
                    examAssignatureName: item.name,
                })) }));
        }
    }
    else {
        return (_jsxs(_Fragment, { children: [_jsx("p", { children: state.error?.code }), _jsx("p", { children: state.error?.kind }), _jsx("p", { children: state.error?.message })] }));
    }
}
function examTimelineItem({ examAssignatureName, examDate, id, }) {
    const color = "hsl(34, 100%, 70%)";
    const darkColor = getIconColor(color);
    return (_jsxs("div", { className: "exams-timeline-widget-item", style: { backgroundColor: darkColor }, children: [_jsx("div", { className: "exams-timeline-widget-item__date", style: { border: `2px solid ${color}` }, children: TimestampToString(examDate) }), _jsxs("div", { className: "exams-timeline-widget-item__content", children: [_jsx("div", { className: "exams-timeline-widget-item__content--icon", style: { backgroundColor: color }, children: _jsx(Icon, { name: "IconBriefcase", color: darkColor }) }), _jsx("span", { className: "exams-timeline-widget-item__content--assignature-name", children: examAssignatureName })] })] }, id));
}
function getIconColor(color) {
    return color.replace("70%", "25%");
}
function TimestampToString(timestamp) {
    const date = timestamp.toDate().getTime();
    const now = new Date().setHours(23, 59, 59, 0);
    const diff = date - now;
    const interClassName = "exams-timeline-widget-item__date--text";
    if (diff === 0)
        return _jsx("span", { className: interClassName, children: "Hoy" });
    else {
        const days = diff / 86400000;
        let innerText = "";
        if (days < 7)
            innerText = `${days} D`; // 1–6 días
        else if (days < 30)
            innerText = `${Math.floor(days / 7)} S`; // semanas
        else if (days < 365)
            innerText = `${Math.floor(days / 30)} M`; // meses
        else
            innerText = `${Math.floor(days / 365)} A`; // años
        return (_jsx(_Fragment, { children: _jsxs("span", { className: interClassName, children: [" ", innerText, " "] }) }));
    }
}
