import { Header } from "#components/organisms/header";
import useWidgets from "#features/widgets/presentation/hooks/useWidgets";
import { DateTimeBadge } from "#components/atoms/datetimebadge";
import { Dashboard } from "#components/organisms/dashboard/dashboard";
import { useState } from "react";
import { EditModeButton } from "#components/molecules/toolbar/toolBar";
import useAuth from "#core/auth/presentation/hooks/useAuth";
import { Rise } from "#components/molecules/rise";
import usePanels from "#features/panels/presentation/hooks/usePanels";

export default function HomePage() {
  const [riseOpen, setRiseOpen] = useState(false);
  const { fetchHomePanel } = usePanels();

  fetchHomePanel();

  return (
    <>
      {riseOpen ? (
        <Rise
          onClose={() => setRiseOpen(false)}
          sections={[
            {
              title: "Hola",
              items: [
                {
                  type: "meeting",
                  id: "1",
                  title: "HolaHola",
                },
              ],
              icon: "IconSpy",
            },
          ]} // tus datos reales
          onItemClick={(item) => console.log(item)}
          onItemStatusChange={(id, status) =>
            console.log("Status change", id, status)
          }
          isOpen={riseOpen}
        />
      ) : (
        <HomePageComponent onOpenRise={() => setRiseOpen(true)} />
      )}
    </>
  );
}

function HomePageComponent({ onOpenRise }: { onOpenRise: () => void }) {
  const { signOut } = useAuth();
  // const { config, isDark, setMode } = useTheme();
  const { state: widgetsState } = useWidgets();

  console.log("HomePage - widgetsState: ", widgetsState);

  const [editMode, setEditMode] = useState(false);

  // function toggleTheme() {
  //   if (config.mode === "system") {
  //     setMode(isDark ? "light" : "dark");
  //   } else {
  //     setMode(config.mode === "light" ? "dark" : "light");
  //   }
  // }

  return (
    <>
      <Header
        actions={[
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
        dateTimeItem={<DateTimeBadge onClick={onOpenRise} />}
      />
      <Dashboard widgetList={widgetsState.widgets} editMode={editMode} />
    </>
  );
}
