import { Header } from "#components/organisms/header";
import useWidgets from "#features/widgets/presentation/hooks/useWidgets";
import { DateTimeBadge } from "#components/atoms/datetimebadge";
import { Dashboard } from "#components/organisms/dashboard/dashboard";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { EditModeButton } from "#components/molecules/toolbar/toolBar";
import useAuth from "#core/auth/presentation/hooks/useAuth";
import { Rise } from "#components/molecules/rise";
import { Modal, ModalHeader, ModalBody } from "#components/molecules/modal";

export default function HomePage() {
  const [riseOpen, setRiseOpen] = useState(false);

  return (
    <>
      <NeedsPanelModal />
      <InvalidPanelNotice />
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
          ]}
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

/**
 * Red de seguridad para URLs como "/home/task" que no existen como página
 * real (las tareas siempre pertenecen a un panel). `panel.loader.ts`
 * redirige acá con `?openModal=...` en vez de dejar navegar a esa ruta.
 * En el flujo normal esto nunca debería dispararse — la navegación real
 * pasa por `useOpenTaskList`, que ni siquiera intenta ir ahí.
 */
function NeedsPanelModal() {
  const [searchParams, setSearchParams] = useSearchParams();
  const openModal = searchParams.get("openModal");

  if (!openModal) return null;

  const close = () => {
    searchParams.delete("openModal");
    setSearchParams(searchParams, { replace: true });
  };

  return (
    <Modal onClose={close}>
      <ModalHeader title="Elegí un panel" onClose={close} />
      <ModalBody>
        <p>
          Las tareas y el calendario pertenecen a un panel. Elegí uno desde el
          dashboard para verlas.
        </p>
      </ModalBody>
    </Modal>
  );
}

/**
 * `panel.loader.ts` redirige acá con `?invalidPanel=1` cuando la cadena de
 * `:pid` de la URL no existe o no respeta la jerarquía real de paneles
 * (alguien la escribió a mano, o un panel fue borrado mientras la tenía
 * abierta). Nunca es un error de la app — solo avisamos y volvemos al
 * dashboard limpio.
 */
function InvalidPanelNotice() {
  const [searchParams, setSearchParams] = useSearchParams();
  const invalidPanel = searchParams.get("invalidPanel");

  if (!invalidPanel) return null;

  const close = () => {
    searchParams.delete("invalidPanel");
    setSearchParams(searchParams, { replace: true });
  };

  return (
    <Modal onClose={close}>
      <ModalHeader title="Ese panel ya no existe" onClose={close} />
      <ModalBody>
        <p>
          El enlace que abriste apunta a un panel que fue eliminado o movido.
          Te trajimos de vuelta al dashboard.
        </p>
      </ModalBody>
    </Modal>
  );
}

function HomePageComponent({ onOpenRise }: { onOpenRise: () => void }) {
  const { signOut } = useAuth();
  // const { config, isDark, setMode } = useTheme();
  const { state: widgetsState, toggleEditMode } = useWidgets();

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
                editMode={widgetsState.editMode}
                onToggle={toggleEditMode}
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
                icon: "IconSettings",
                label: "Ajustes",
                onClick: () => {
                  window.location.href = "/settings";
                }
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
      <Dashboard widgetState={widgetsState} />
    </>
  );
}
