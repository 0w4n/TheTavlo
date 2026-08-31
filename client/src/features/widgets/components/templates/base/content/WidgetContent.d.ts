import type { Widget } from "#features/widgets/domain/widget.entity";
export default function WidgetContent({ widget, multiSelection, }: {
    widget: Widget;
    multiSelection: boolean;
}): import("react").JSX.Element;
