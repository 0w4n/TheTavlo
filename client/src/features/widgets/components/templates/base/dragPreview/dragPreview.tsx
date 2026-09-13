import type { Widget } from "#features/widgets/domain/widget.entity";
import WidgetRenderer from "#core/widgets/presentation/WidgetRenderer";

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
        <WidgetRenderer
          type={widget.type}
          widgetId={widget.id}
          config={widget.config}
        />
      </div>
    </div>
  );
}
