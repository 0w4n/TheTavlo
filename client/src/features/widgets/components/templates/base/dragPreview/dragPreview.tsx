import type { Widget } from "#features/widgets/domain/widget.entity";
import WidgetContent from "../content/WidgetContent";

export default function WidgetDragPreview({ widget }: { widget: Widget }) {
  return (
    <div
      style={{
        width: 280,
        background: "var(--color-backgroundSecondary)",
        borderRadius: "12px",
        boxShadow: "0 12px 32px rgba(0,0,0,0.25)",
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      <div style={{ padding: "1rem", maxHeight: 180, overflow: "hidden" }}>
        <WidgetContent widget={widget} multiSelection={false} />
      </div>
    </div>
  );
}
