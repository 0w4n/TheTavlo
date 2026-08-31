import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEvents } from "#features/events/presentation/hooks/useEvents";
export default function ExamList() {
    const { state } = useEvents();
    if (!state || state.status === "loading") {
        return _jsx("div", { children: "Loading..." });
    }
    if (state.status === "error") {
        return _jsx("div", { children: "Error loading exams." });
    }
    const exams = state.event.filter((event) => event.type === "exam");
    return (_jsxs("div", { children: [_jsx("h1", { children: "Exam List" }), _jsx("div", { children: exams.map((exam) => (_jsxs("div", { children: [_jsx("h2", { children: exam.name }), _jsx("p", { children: exam.makeAt.toString() })] }, exam.id))) })] }));
}
