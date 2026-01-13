import { Button } from "#components/atoms/button";
import Icon from "#shared/ui/atoms/icons";
import "./toolBar.css";
import useWidgets from "#features/widgets/presentation/hooks/useWidgets";
import usePanels from "#features/panels/presentation/hooks/usePanels";
import ModalPortal from "../modal/modalPortal";
import { createPortal } from "react-dom";
import AddWidgetDialog from "#components/AddWidgetDialog";
import type { Widget, WidgetType } from "#features/widgets/domain/widget.entity";

interface EditModeButtonProps {
  editMode: boolean;
  onToggle: () => void;
  isHome: boolean;
}

export function EditModeButton({ isHome=false, editMode, onToggle }: EditModeButtonProps) {
  const {
      state: widgetsState,
      addWidget,
      toggleEditMode,
      compactWidgets,
    } = useWidgets();

    const {state: panelsState} = usePanels();

  return (
    <>
      <div className="EditModeButton">
        <Button variant="primary" onClick={onToggle} className="icon-only">
          <Icon name={editMode ? "IconCheck" : "IconPencil"} />
        </Button>
      </div>

      {editMode &&
        createPortal(
          <DashboardEditPanel
            isHome={isHome}
            onAdd={(type) => addWidget(type)}
            onCompact={compactWidgets}
            onDelete={function (): void {
              throw new Error("Function not implemented.");
            }}
            onConfigure={function (): void {
              throw new Error("Function not implemented.");
            }}
          />,
          document.body
        )}
    </>
  );
}

interface DashboardEditPanelProps {
  isHome: boolean;
  onAdd: (type: WidgetType) => Promise<Widget>;
  onCompact: () => void;
  onDelete: () => void;
  onConfigure: () => void;
}

function DashboardEditPanel({
  isHome= false,
  onAdd,
  onCompact,
  onDelete,
  onConfigure,
}: DashboardEditPanelProps) {
  return (
    <div className="DashboardEditPanel">
      <ModalPortal
        iconName="IconLayoutGridAdd"
        children={(onClose) => <AddWidgetDialog onAddWidget={onAdd} onClose={onClose} isHome={isHome}/>}
      />

      <Button onClick={onCompact} title="Compactar">
        <Icon name={"IconArrowsMinimize"} />
      </Button>

      <Button title="Mover">
        <Icon name={"IconArrowsMove"} />
      </Button>

      <Button title="Redimensionar">
        <Icon name={"IconArrowsUpLeft"} />
      </Button>

      <Button onClick={onDelete} title="Eliminar">
        <Icon name={"IconTrash"} />
      </Button>

      <Button onClick={onConfigure} title="Configurar">
        <Icon name={"IconSettings"} />
      </Button>
    </div>
  );
}
