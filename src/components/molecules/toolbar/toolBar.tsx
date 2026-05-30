import { Button } from "#components/atoms/button";
import Icon from "#shared/ui/atoms/icons";
import "./toolBar.css";
import useWidgets from "#features/widgets/presentation/hooks/useWidgets";
import ModalPortal from "../modal/portal";
import { createPortal } from "react-dom";
import AddWidget from "#components/templates/dialog/modWidget/addWidget";
import type {
  Widget,
  WidgetType,
} from "#features/widgets/domain/widget.entity";

interface EditModeButtonProps {
  editMode: boolean;
  onToggle: () => void;
}

export function EditModeButton({
  editMode,
  onToggle,
}: EditModeButtonProps) {
  const { addWidget } = useWidgets();

  return (
    <>
      <div className="EditModeButton">
        <Button
          variant="primary"
          onClick={onToggle}
          icon={editMode ? "IconCheck" : "IconPencil"}
          iconSize={16}
        ></Button>
      </div>

      {editMode &&
        createPortal(
          <DashboardEditPanel
            onAdd={(type:WidgetType) => addWidget(type)}
          />,
          document.body,
        )}
    </>
  );
}

interface DashboardEditPanelProps {
  onAdd: (type: WidgetType) => Promise<Widget>;
}

function DashboardEditPanel({
  onAdd,
}: DashboardEditPanelProps) {
  return (
    <div className="DashboardEditPanel">
      <span>⫶⫶</span>
      <ModalPortal iconName="IconLayoutGridAdd">
        {(onClose) => (
          <AddWidget
            onAddWidget={onAdd}
            onClose={onClose}
          />
        )}
      </ModalPortal>

      <Button title="Mover">
        <Icon name={"IconArrowsMove"} />
      </Button>

      <Button title="Redimensionar">
        <Icon name={"IconArrowsUpLeft"} />
      </Button>
    </div>
  );
}
