import type { Widget, WidgetType } from "#features/widgets/domain/widget.entity";
import "./widgetContainer.css";
export default function WidgetContainer({ type, widget, editMode, }: {
    type: WidgetType;
    widget: Widget;
    editMode: boolean;
    onResize?: (layout: Widget["layout"]) => void;
}): import("react").JSX.Element;
