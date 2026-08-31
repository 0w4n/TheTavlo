import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import LoadingPage from "#components/pages/LoadingPage";
import { isNodeTask, isTask } from "#features/task/domain/task.entity";
import useTasks from "#features/task/presentation/hooks/useTask";
import usePanels from "#features/panels/presentation/hooks/usePanels";
import Icon from "#shared/ui/atoms/icons";
import { Badge } from "#components/atoms/badge";
import "./taskWidget.css";
export function TaskWidget() {
    const { state: taskState } = useTasks();
    const { state: panelState } = usePanels();
    console.log("status Task: ", taskState);
    if (panelState.status !== "panel") {
        return _jsx(LoadingPage, {});
    }
    if (taskState.status !== "task") {
        return _jsx(LoadingPage, {});
    }
    const currentPanel = panelState.currentPanel;
    const currentTasks = taskState.currentTask;
    if (!taskState.status || currentPanel === undefined) {
        return _jsx("span", { children: "No hay nada" });
    }
    else {
        return (_jsx(_Fragment, { children: currentTasks.map((item) => taskItem(item)) }));
    }
}
function taskItem(item) {
    if (isTask(item)) {
        console.log("Task: ", item);
        return (_jsx(_Fragment, { children: _jsxs("div", { className: "task__item", children: [_jsx(Badge, { variant: item.progress, collapsed: true }), _jsxs("div", { className: "task__item-content", children: [_jsx("span", { children: item.endAt.toDate().getDate() }), _jsxs("div", { className: "task__item-content--text", children: [_jsx(Icon, { name: "IconUsersGroup", color: "hsl(0, 0%, 80%)", size: 18 }), _jsx("span", { children: item.title }), _jsx(Icon, { name: "IconArrowNarrowRightDashed", color: "#fff" })] })] })] }) }));
    }
    else if (isNodeTask(item)) {
        console.log("Node task: ", item);
        return (_jsx(_Fragment, { children: _jsx("div", { className: "task__item", children: _jsxs("div", { className: "task__item-content", children: [_jsx("span", { children: item.endAt.toDate().getDate() }), _jsxs("div", { className: "task__item-content--text", children: [_jsx("span", { children: item.title }), _jsx(Icon, { name: "IconArrowNarrowRightDashed", color: "#fff" })] })] }) }) }));
    }
    else {
        return (_jsx(_Fragment, { children: _jsx("div", { className: "task__item", children: _jsx("p", { children: "Error" }) }) }));
    }
}
