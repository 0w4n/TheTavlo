import { useRouteLoaderData } from "react-router-dom";
import "./panelsPage.css";
import { useRef, useState, useEffect } from "react";
import type { Panel } from "#features/panels/domain/panel.entity";
import { Dashboard } from "#components/organisms/dashboard/dashboard";
import { Header } from "#components/organisms/header";
import { ThemeSettingsDialog } from "#components/ThemeSettingsDialog";
import { EditModeButton } from "#components/molecules/toolbar/toolBar";
import { DateTimeBadge } from "#components/atoms/datetimebadge";
import useAuth from "#core/auth/presentation/hooks/useAuth";
import useWidgets from "#features/widgets/presentation/hooks/useWidgets";
import usePanels from "#features/panels/presentation/hooks/usePanels";

export default function PanelsPage() {
  const { signOut } = useAuth();
  const { state: widgetsState } = useWidgets();
  const { selectPanel } = usePanels();

  const panelData = useRouteLoaderData("1-0-1") as Panel;
  console.info("PanelData: ", panelData);

  useEffect(() => {
    selectPanel(panelData);
  }, [panelData]);

  const headerRef = useRef<HTMLDivElement>(null);
  const [editMode, setEditMode] = useState(false);

  headerRef.current?.style.setProperty(
    "background-color",
    `hsl(${panelData.color}, 100%, 20%)`,
  );

  if (!panelData) {
     throw new Response(
       "[(ts)PanelsPage:39]@Panel no encontrado",
       { status: 404 },
     );
  }

  return (
    <>
      <Header
        actions={[
          {
            type: "dialog",
            icon: "IconWand",
            dialog: (onClose) => <ThemeSettingsDialog onClose={onClose} />,
          },
          {
            type: "children",
            children: (
              <EditModeButton
                isHome={true}
                editMode={editMode}
                onToggle={() => setEditMode(!editMode)}
              />
            ),
          },
          {
            type: "dropdown",
            iconTrigger: "IconUser",
            options: [
              {
                icon: "IconUser",
                label: "Hola",
                onClick: () => {
                  console.log("Hola");
                },
              },
              {
                icon: "IconLogout",
                label: "Cerrar Sesión",
                danger: true,
                onClick: () => {
                  signOut();
                },
              },
            ],
          },
        ]}
        dateTimeItem={<DateTimeBadge onClick={() => {}} />}
      />
      <Dashboard widgetList={widgetsState.widgets} editMode={editMode} />
    </>
  );
}
