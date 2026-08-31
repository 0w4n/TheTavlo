import type { Widget, WidgetType } from "#features/widgets/domain/widget.entity";
import "./addWidget.css";
interface AddWidgetProps {
    onClose: () => void;
    onAddWidget: (type: WidgetType) => Promise<Widget>;
}
export default function AddWidget({ onClose, onAddWidget }: AddWidgetProps): import("react").JSX.Element;
export {};
