import { Modal } from "#components/molecules/modal";
import type { WidgetType } from "#features/widgets/domain/widget.entity";
import WidgetRenderer from "../renderer/WidgetRenderer";

interface widgetPreviewProps {
  onClose: () => void;
  type: WidgetType;
}

export default function WidgetPreview({ onClose, type }: widgetPreviewProps) {
  return (
    <>
      <Modal.Header onClose={onClose} title="Vista previa del widget"></Modal.Header>

      <Modal.Body>
        <WidgetRenderer type={type} widgetId="preview" config={{}} />
      </Modal.Body>
    </>
  );
}
