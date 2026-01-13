import type { Widget, WidgetType } from "../features/widgets/domain/widget.entity";
import { WIDGET_TEMPLATES } from "../features/widgets/domain/widgetTemplates";
import { useState } from "react";
import Icon from "#shared/ui/atoms/icons";
import "./AddWidgetDialog.css";
import { Button } from "./atoms/button";

interface AddWidgetDialogProps {
  isHome: boolean;
  onClose: () => void;
  onAddWidget: (type: WidgetType) => Promise<Widget>;
}

export default function AddWidgetDialog({
  isHome,
  onClose,
  onAddWidget,
}: AddWidgetDialogProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [loading, setLoading] = useState(false);

  const categories = [
    { key: "tasks", icon: "IconCheckbox", isHome: false },
    { key: "events", icon: "IconCalendar", isHome: true },
    { key: "exams", icon: "IconFile", isHome: true },
    { key: "productivity", icon: "IconGraph", isHome: true },
    { key: "other", icon: "IconDots", isHome: true },
  ];

  const filteredTemplates =
    selectedCategory === "all"
      ? WIDGET_TEMPLATES
      : WIDGET_TEMPLATES.filter((t) => t.category === selectedCategory);

  const handleAddWidget = async (type: WidgetType) => {
    setLoading(true);
    try {
      await onAddWidget(type);
      console.log(type);
      onClose();
    } catch (error) {
      console.error(error);
      alert("Error al agregar widget");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="AddDialogBox">
      <div className="HeaderDialog">
        <span>Agregar Widget</span>
        <button onClick={onClose}>
          <Icon name="IconX" stroke={2.5} size={32} />
        </button>
      </div>
      <div className="CategoriasDialog">
        {categories
          .filter((cat) => cat.isHome == !isHome)
          .map((cat) => (
            <Button
              variant="secondary"
              key={cat.key}
              onClick={() =>
                setSelectedCategory(
                  cat.key === selectedCategory ? "all" : cat.key
                )
              }
              className={selectedCategory === cat.key ? "selected" : undefined}
            >
              <Icon name={cat.icon} size={28} />
            </Button>
          ))}
      </div>
      <div className="ContentDialog">
        {filteredTemplates.map((template) => (
          <button
            key={template.type}
            onClick={() => handleAddWidget(template.type)}
            disabled={loading}
            style={{
              padding: "1.5rem",
              border: "2px solid #e0e0e0",
              borderRadius: "12px",
              background: "white",
              cursor: loading ? "not-allowed" : "pointer",
              textAlign: "left",
              transition: "all 0.2s",
            }}
            onMouseOver={(e) => {
              if (!loading) {
                e.currentTarget.style.borderColor = "#667eea";
                e.currentTarget.style.boxShadow =
                  "0 4px 12px rgba(102, 126, 234, 0.2)";
              }
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = "#e0e0e0";
              e.currentTarget.style.boxShadow = "none";
            }}
            className="ContentDialog-Item"
          >
            <div
              style={{
                fontSize: "2rem",
                marginBottom: "0.5rem",
              }}
            >
              {template.icon}
            </div>
            <div
              style={{
                fontWeight: "600",
                marginBottom: "0.25rem",
                fontSize: "1rem",
              }}
            >
              {template.title}
            </div>
            <div
              style={{
                fontSize: "0.85rem",
                color: "var(--color-textSecondary)",
                lineHeight: "1.4",
              }}
            >
              {template.description}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
