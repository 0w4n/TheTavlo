import { Modal } from "#components/molecules/modal";
import type { WidgetType } from "#features/widgets/domain/widget.entity";
import WidgetContent from "../content/WidgetContent";
import { Timestamp } from "firebase/firestore";

interface widgetPreviewProps {
  onClose: () => void;
  type: WidgetType;
}
export default function WidgetPreview({ onClose, type }: widgetPreviewProps) {
  const widget = {
    id: "preview",
    type,
    layout: { lg: { x: 0, y: 0, w: 4, h: 2 } },
    config: {},
    isHome: true,
    locked: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  console.log(widget);

  return (
    <>
      <Modal.Header onClose={onClose}>
        <p>Preview del widget</p>
      </Modal.Header>

      <Modal.Body>
        <WidgetContent widget={widget} />
      </Modal.Body>
    </>
  );
}
