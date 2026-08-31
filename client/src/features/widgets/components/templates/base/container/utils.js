import { jsx as _jsx } from "react/jsx-runtime";
import { AddTask } from "../../task/addTask";
import { AddPanels } from "../../../../../panels/components/templates/widget/addPanel/addPanels";
export function getIconWidgetType(widgetType) {
    switch (widgetType) {
        case "task-list":
            return "IconChecklist";
        case "panels-list":
            return "IconFolders";
        case "event-calendar":
            return "IconCalendar";
        case "event-list":
            return "IconListDetails";
        case "exam-timeline":
            return "IconTimeline";
        case "exam-countdown":
            return "IconAlarm";
        case "statistics":
            return "IconChartBar";
        case "quick-add":
            return "IconPlus";
        case "recent-activity":
            return "IconHistory";
        case "upcoming-deadlines":
            return "IconClock";
        case "productivity-chart":
            return "IconActivity";
        case "notes":
            return "IconNotes";
        case "custom":
            return "IconWidget";
        default:
            return "IconHelpCircle";
    }
}
export function GetDialogWdigetType({ widgetType, onClose, }) {
    switch (widgetType) {
        case "task-list":
            return _jsx(AddTask, { onClose: onClose });
        case "panels-list":
            return _jsx(AddPanels, { onClose: onClose });
        // case "event-calendar":
        //   return "IconCalendar";
        // case "event-list":
        //   return "IconListDetails";
        // case "exam-timeline":
        //   return "IconTimeline";
        // case "exam-countdown":
        //   return "IconAlarm";
        // case "statistics":
        //   return "IconChartBar";
        // case "quick-add":
        //   return "IconPlus";
        // case "recent-activity":
        //   return "IconHistory";
        // case "upcoming-deadlines":
        //   return "IconClock";
        // case "productivity-chart":
        //   return "IconActivity";
        // case "notes":
        //   return "IconNotes";
        // case "custom":
        //   return "IconWidget";
        default:
            return _jsx("span", { children: " Error " });
    }
}
