import Icon from "#shared/ui/atoms/icons";

interface DashboardToolbarProps {
  editMode: boolean;
  onToggleEditMode: () => void;
  onAddWidget: () => void;
  onCompactWidgets: () => void;
}

export function DashboardToolbar({
  editMode,
  onToggleEditMode,
  onAddWidget,
  onCompactWidgets,
}: DashboardToolbarProps) {
  return (
    <div
      style={{
        display: "flex",
        gap: "0.75rem",
        padding: "1rem",
        background: "white",
        borderBottom: "1px solid #e0e0e0",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <button
        onClick={onToggleEditMode}
        style={{
          padding: "1rem",
          border: "none",
          borderRadius: "8px",
          background: editMode ? "#667eea" : "#f0f4ff",
          color: editMode ? "white" : "#667eea",
          fontWeight: "600",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
        }}
      >
        {editMode ? <Icon name={"IconPencil"} /> : <Icon name={"IconPencilEdit"} />}
      </button>

      {editMode && (
        <>
          <button
            onClick={onAddWidget}
            style={{
              padding: "1rem",
              border: "2px solid #667eea",
              borderRadius: "8px",
              background: "white",
              color: "#667eea",
              fontWeight: "600",
              cursor: "pointer",
              fontSize: "0.95rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <Icon name={"IconLayoutGridAdd"} />
          </button>

          <button
            onClick={onCompactWidgets}
            style={{
              padding: "1rem",
              border: "1px solid #ddd",
              borderRadius: "8px",
              background: "white",
              color: "#666",
              fontWeight: "500",
              cursor: "pointer",
              fontSize: "0.95rem",
            }}
          >
            <Icon name={"IconPencilBolt"} />
          </button>
        </>
      )}

      {editMode && (
        <div
          style={{
            marginLeft: "auto",
            padding: "0.75rem 1rem",
            background: "#fff3cd",
            borderRadius: "8px",
            fontSize: "0.9rem",
            color: "#856404",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          💡 Arrastra los widgets para moverlos, usa el control para
          redimensionar
        </div>
      )}
    </div>
  );
}
