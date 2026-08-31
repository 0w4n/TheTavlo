import type {
  Widget,
  WidgetType,
} from "#features/widgets/domain/widget.entity";
import { WIDGET_TEMPLATES } from "#features/widgets/domain/widgetTemplates";
import { useState } from "react";
import { Button } from "../../../atoms/button";
import { Modal } from "#components/molecules/modal";
import WidgetPreview from "#features/widgets/components/templates/base/preview/widgetPreview";
import ModalPortal from "#components/molecules/modal/portal";

import "./addWidget.css";

interface AddWidgetProps {
  onClose: () => void;
  onAddWidget: (type: WidgetType) => Promise<Widget>;
}

export default function AddWidget({ onClose, onAddWidget }: AddWidgetProps) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedWidget, setSelectedWidget] = useState<WidgetType>();
  const [loading, setLoading] = useState(false);
  const [isSelected, setSelected] = useState(false);

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

      setSelected(false);
      onClose();

      return res;
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectedWidget = (type: WidgetType) => {
    setSelected(true);
    setSelectedWidget(type);
  };

  return (
    <>
      <Modal.Header onClose={onClose} title="Añade un widget"></Modal.Header>

      <Modal.Body>
        <aside className="CategoriasDialog">
          {categories.map((cat) => (
            <Button
              key={cat.key}
              variant="secondary"
              className={selectedCategory === cat.key ? "selected" : undefined}
              icon={cat.icon}
              iconSize={28}
              label={cat.key}
              onClick={() =>
                setSelectedCategory(
                  cat.key === selectedCategory ? "all" : cat.key,
                )
              }
            />
          ))}
        </aside>

        <div className="ContentDialog">
          {filteredTemplates.map((template) => (
            <Button
              key={template.type}
              disabled={loading || template.commingSoon}
              label={template.commingSoon ? "Comming Soon" : template.title}
              icon={template.commingSoon ? undefined : template.icon}
              onClick={() => handleSelectedWidget(template.type)}
              onDoubleClick={() => handleAddWidget(template.type)}
              className={`ContentDialog-Item ${selectedWidget === template.type ? " :focus" : ""}`}
            />
          ))}
        </div>
      </Modal.Body>

      <Modal.Footer>
        <ModalPortal
          variant="secondary"
          disabled={!isSelected || loading}
          label={isSelected ? "Vista previa" : "Seleccione un widget"}
          iconName="IconEye"
        >
          {(onClose) => (
            <WidgetPreview onClose={onClose} type={selectedWidget!} />
          )}
        </ModalPortal>
        <Button
          variant="primary"
          onClick={() => handleAddWidget(selectedWidget!)}
          disabled={!isSelected || loading}
          label={isSelected ? "Añadir widget" : "Seleccione un widget"}
          icon="IconPlus"
        />
      </Modal.Footer>
    </>
  );
}
