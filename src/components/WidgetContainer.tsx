import type { Widget } from "#features/widgets/domain/widget.entity";
import WidgetContent from "./WidgetContent";

interface WidgetContainerProps {
  widget: Widget;
  editMode: boolean;
  onDragStart: (e: React.MouseEvent) => void;
  onResizeStart: (e: React.MouseEvent) => void;
  onRemove: () => void;
  onConfig: () => void;
}

export default function WidgetContainer({
  widget,
  editMode,
  onDragStart,
  onResizeStart,
  onRemove,
  onConfig,
}: WidgetContainerProps) {
  return (
    <div
      style={{
        height: "100%",
        background: "var(--color-backgroundSecondary)",
        borderRadius: "12px",
        boxShadow: editMode
          ? "0 4px 12px rgba(102, 126, 234, 0.2)"
          : "0 2px 8px rgba(0, 0, 0, 0.1)",
        border: editMode ? "2px solid #667eea" : undefined,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
      onMouseDown={onDragStart}
    >
      {/* Widget Header */}
      <div
        style={{
          padding: "0.75rem 1rem",
          borderRadius: "8px",
          margin: "0.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "var(--color-surface)",
          cursor: editMode && !widget.locked ? "move" : "default",
        }}
        className="widget__header"
      >
        <div
          style={{
            fontWeight: "600",
            fontSize: "0.95rem",
            color: "var(--color-textPrimary)",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          {widget.locked && <span>🔒</span>}
          {widget.title}
        </div>

        {editMode && (
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onConfig();
              }}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                fontSize: "1rem",
                padding: "0.25rem",
              }}
              title="Configurar"
            >
              ⚙️
            </button>
            {!widget.locked && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm("¿Eliminar este widget?")) {
                    onRemove();
                  }
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "1rem",
                  padding: "0.25rem",
                  color: "#e74c3c",
                }}
                title="Eliminar"
              >
                ✕
              </button>
            )}
          </div>
        )}
      </div>

      {/* Widget Content */}
      <div
        style={{
          flex: 1,
          alignContent: "center",
          justifyContent: "center",
          overflow: "auto",
          padding: "1rem",
        }}
      >
        <WidgetContent widget={widget} />
      </div>

      {/* Resize Handle */}
      {editMode && !widget.locked && (
        <div
          onMouseDown={(e) => {
            e.stopPropagation();
            onResizeStart(e);
          }}
          style={{
            width: "20px",
            height: "20px",
            cursor: "se-resize",
            background: "linear-gradient(135deg, transparent 50%, #667eea 50%)",
            borderBottomRightRadius: "12px",
          }}
        />
      )}
    </div>
  );
}
