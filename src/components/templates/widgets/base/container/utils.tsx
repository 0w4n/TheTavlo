import type { WidgetType } from "#features/widgets/domain/widget.entity";
import type { JSX } from "react";
import { AddTask } from "../../task/addTask";
import { AddPanels } from "../../panels/addPanels";

export function getIconWidgetType(widgetType: WidgetType): string {
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

export function GetDialogWdigetType({widgetType, onClose}:{widgetType: WidgetType, onClose: () => void}): JSX.Element {
  switch (widgetType) {
    case "task-list":
      return <AddTask onClose={onClose}/>;
    case "panels-list":
       return <AddPanels onClose={onClose}/>;
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
       return <span> Error </span>;
  }
}