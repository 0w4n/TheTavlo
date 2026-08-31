import type { WidgetType } from "#features/widgets/domain/widget.entity";
interface widgetPreviewProps {
    onClose: () => void;
    type: WidgetType;
}
export default function WidgetPreview({ onClose, type }: widgetPreviewProps): import("react").JSX.Element;
export {};
