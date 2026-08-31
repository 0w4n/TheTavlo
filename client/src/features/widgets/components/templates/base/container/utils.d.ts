import type { WidgetType } from "#features/widgets/domain/widget.entity";
import type { JSX } from "react";
export declare function getIconWidgetType(widgetType: WidgetType): string;
export declare function GetDialogWdigetType({ widgetType, onClose, }: {
    widgetType: WidgetType;
    onClose: () => void;
}): JSX.Element;
