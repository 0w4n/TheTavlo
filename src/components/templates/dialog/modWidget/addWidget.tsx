import type {
  Widget,
  WidgetType,
} from "#features/widgets/domain/widget.entity";
import { WIDGET_TEMPLATES } from "#features/widgets/domain/widgetTemplates";
import { useState } from "react";
import Icon from "#shared/ui/atoms/icons";
import { Button } from "../../../atoms/button";
import { Modal } from "#components/molecules/modal";
import "./addWidget.css";

interface AddWidgetProps {
  isHome: boolean;
  onClose: () => void;
  onAddWidget: (type: WidgetType) => Promise<Widget>;
}

export default function AddWidget({
  isHome,
  onClose,
  onAddWidget,
}: AddWidgetProps) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(false);
  const [errorIs, setError] = useState<unknown>();

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
      const res = await onAddWidget(type);

      onClose();
      return res
    } catch(error) {
      setError(error)
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal.Header onClose={onClose}>
        <h2 id="modal__title">Agregar Widget</h2>
      </Modal.Header>

      <Modal.Body>
        <div className="CategoriasDialog">
          {categories
            .map((cat) => (
              <Button
                key={cat.key}
                variant="secondary"
                className={
                  selectedCategory === cat.key ? "selected" : undefined
                }
                onClick={() =>
                  setSelectedCategory(
                    cat.key === selectedCategory ? "all" : cat.key,
                  )
                }
              >
                <Icon name={cat.icon} size={28} />
              </Button>
            ))}
        </div>

        <div className="ContentDialog">
          {filteredTemplates.map((template) => (
            <Button
              key={template.type}
              disabled={loading}
              label={`${template.title} ${errorIs}`}
              icon={template.icon}
              onClick={() => handleAddWidget(template.type)}
              className="ContentDialog-Item"
            />
          ))}
        </div>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose} label="Cancelar" />
      </Modal.Footer>
    </>
  );
}
