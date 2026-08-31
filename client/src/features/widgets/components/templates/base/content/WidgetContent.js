import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import PanelsWidget from "../../../../../panels/components/templates/widget/panelsWidget";
import UpcomingDeadlinesWidget from "../../upcomingDeadLine/upcomingDeadLine";
import ExamsTimelineWidget from "../../examsTimeline/examsTimelineWidget";
import usePanels from "#features/panels/presentation/hooks/usePanels";
import { TaskWidget } from "../../task/taskWidget";
import CookingBookWidget from "#features/cookingBook/components/template/widget/CookingBook";
import NoteWidget from "#features/note/components/templates/widget/Note.widget";
export default function WidgetContent({ widget, multiSelection, }) {
    const { state } = usePanels();
    const subPanels = state.status === "panel" ? state.subPanels : [];
    const select = multiSelection;
    console.log(select);
    switch (widget.type) {
        case "task-list":
            return _jsx(TaskWidget, {});
        case "panels-list":
            return _jsx(PanelsWidget, { items: subPanels, config: { typeView: "list" } });
        // case "event-calendar":
        //   return (
        //     <EventCalendarWidget panelId={widget.panelId} config={widget.config} />
        //   );
        // case "event-list":
        //   return (
        //     <EventListWidget panelId={widget.panelId} config={widget.config} />
        //   );
        case "exam-timeline":
            return _jsx(ExamsTimelineWidget, {});
        // case "exam-countdown":
        //   return (
        //     <ExamCountdownWidget panelId={widget.panelId} config={widget.config} />
        //   );
        // case "statistics":
        //   return (
        //     <StatisticsWidget panelId={widget.panelId} config={widget.config} />
        //   );
        // case "quick-add":
        //   return <DonutChartWidget panelId={panelId} />;
        // case "recent-activity":
        //   return (
        //     <RecentActivityWidget panelId={widget.panelId} config={widget.config} />
        //   );
        case "upcoming-deadlines":
            return (_jsx(UpcomingDeadlinesWidget
            // panelId={widget.panelId}
            // config={widget.config}
            , {}));
        // case "productivity-chart":
        //   return (
        //     <ProductivityChartWidget panelId={panelId} config={widget.config} />
        //   );
        case "notes":
            return _jsx(NoteWidget, {});
        case "cooking-book":
            return _jsx(CookingBookWidget, {});
        default:
            return _jsxs("div", { children: ["Widget no implementado: ", widget.type] });
    }
}
