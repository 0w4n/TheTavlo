import type { WidgetType } from "#features/widgets/domain/widget.entity";

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

export function getShortTitle(title: string): string {
    switch (title) {
      case "Task List":
        return "Tasks";
      case "Panels List":
        return "Panels";
      case "Event Calendar":
        return "Calendar";
      case "Event List":
        return "Events";
      case "Timeline de Exámenes":
        return "Tmln Exámenes";
      case "Exam Countdown":
        return "Countdown";
      case "Statistics":
        return "Stats";
      case "Quick Add":
        return "Add";
      case "Recent Activity":
        return "Activity";
      case "Próximos Vencimientos":
        return "Prox. Vencimientos";
      case "Productivity Chart":
        return "Productivity";
      case "Notes":
        return "Notes";
      case "Custom":
        return "Custom";
      default:
        return title;
    }
}