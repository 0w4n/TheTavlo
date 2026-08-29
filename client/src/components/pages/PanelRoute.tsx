import { useEffect, useRef } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import type { Panel } from "#features/panels/domain/panel.entity";
import type { PanelLoaderData } from "#core/routing/loaders/panel.loader";
import useAuth from "#core/auth/presentation/hooks/useAuth";
import usePanels from "#features/panels/presentation/hooks/usePanels";
import useWidgets from "#features/widgets/presentation/hooks/useWidgets";
import useTasks from "#features/task/presentation/hooks/useTask";
import { useEvents } from "#features/events/presentation/hooks/useEvents";
import { Dashboard } from "#components/organisms/dashboard/dashboard";
import { Header } from "#components/organisms/header";
import PanelLocationBar from "#components/organisms/panelLocationBar/panelLocationBar";
import { EditModeButton } from "#components/molecules/toolbar/toolBar";
import { DateTimeBadge } from "#components/atoms/datetimebadge";
import { Modal, ModalHeader, ModalBody } from "#components/molecules/modal";
import TaskListPage from "./TaskListPage";
import CalendarListPage from "#features/events/components/pages/CalendarListPage";
import LoadingPage from "./LoadingPage";
import CalendarPage from "#features/events/components/pages/CalendarPage";

/**
 * Único componente para toda la cadena `home/:pid[/:pid...]`. Antes había
 * una PanelsPage por cada combinación de rutas; ahora hay un solo switch
 * sobre `data.kind`, que viene ya resuelto por el loader.
 */
export default function PanelRoute() {
  const data = useLoaderData() as PanelLoaderData;
  const { selectPanel } = usePanels();

  // El panel "activo" (widgets, tareas, eventos) es siempre el último de la
  // cadena — nunca uno intermedio. Esto reemplaza el `selectPanel(panelData)`
  // que antes vivía en PanelsPage.tsx con el mismo comportamiento.
  useEffect(() => {
    console.log(data.panel, "seleccionando panel en PanelRoute");
    selectPanel(data.panel);
  }, [data.panel.id]);

  switch (data.kind) {
    case "dashboard":
      return <PanelDashboard panel={data.panel} panels={data.panels} />;
    case "task-list":
      return (
        <PanelChrome
          panel={data.panel}
          panels={data.panels}
          viewLabel="Tareas"
          viewIcon="IconChecklist"
        >
          <TaskListPage panel={data.panel} />
        </PanelChrome>
      );
    case "task-detail":
      return (
        <PanelChrome
          panel={data.panel}
          panels={data.panels}
          viewLabel="Tareas"
          viewIcon="IconChecklist"
        >
          <TaskListPage panel={data.panel} />
          <TaskDetailModal taskId={data.taskId} />
        </PanelChrome>
      );
    case "calendar":
      return <CalendarPage events={[]} />;
    case "event-detail":
      return (
        <PanelChrome
          panel={data.panel}
          panels={data.panels}
          viewLabel="Calendario"
          viewIcon="IconCalendarEvent"
        >
          <CalendarListPage panel={data.panel} />
          <EventDetailModal eventId={data.eventId} />
        </PanelChrome>
      );
  }
}

/** Dashboard de widgets — el mismo componente que usaba HomePage/PanelsPage. */
function PanelDashboard({ panel, panels }: { panel: Panel; panels: Panel[] }) {
  const { signOut } = useAuth();
  const { state: widgetsState, toggleEditMode } = useWidgets();

  return (
    <>
      <PanelHeader
        panel={panel}
        onSignOut={signOut}
        leftAction={
          <EditModeButton
            editMode={widgetsState.editMode}
            onToggle={toggleEditMode}
          />
        }
      />
      <PanelLocationBar panels={panels} />
      <Dashboard widgetState={widgetsState} />
    </>
  );
}

/** Header + wrapper común para las vistas de task-list/calendar (y sus detalles). */
function PanelChrome({
  panel,
  panels,
  viewLabel,
  viewIcon,
  children,
}: {
  panel: Panel;
  panels: Panel[];
  viewLabel?: string;
  viewIcon?: string;
  children: React.ReactNode;
}) {
  const { signOut } = useAuth();
  return (
    <>
      <PanelHeader panel={panel} onSignOut={signOut} />
      <PanelLocationBar
        panels={panels}
        viewLabel={viewLabel}
        viewIcon={viewIcon}
      />
      {children}
    </>
  );
}

function PanelHeader({
  panel,
  onSignOut,
  leftAction,
}: {
  panel: Panel;
  onSignOut: () => void;
  /** Ej. el botón de modo edición — solo tiene sentido en el dashboard de widgets. */
  leftAction?: React.ReactNode;
}) {
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    headerRef.current?.style.setProperty(
      "background-color",
      `hsl(${panel.color}, 100%, 20%)`,
    );
  }, [panel.color]);

  const actions = [
    ...(leftAction
      ? [{ type: "children" as const, children: leftAction }]
      : []),
    {
      type: "dropdown" as const,
      iconTrigger: "IconUser",
      options: [
        {
          icon: "IconSettings",
          label: "Ajustes",
          onClick: () => {
            window.location.href = "/settings";
          },
        },
        {
          icon: "IconLogout",
          label: "Cerrar Sesión",
          danger: true,
          onClick: onSignOut,
        },
      ],
    },
  ];

  return (
    <Header
      actions={actions}
      dateTimeItem={<DateTimeBadge onClick={() => {}} />}
    />
  );
}

/**
 * "/task/:tid" — se pinta encima de la lista de tareas, nunca reemplaza la
 * página. Implementación mínima: solo muestra el título. El formulario de
 * edición completo queda fuera de alcance de este cambio de routing.
 */
function TaskDetailModal({ taskId }: { taskId: string }) {
  // Cerrar el modal = volver a la URL de la lista (quitar el /task/:tid final).
  const navigate = useNavigate();
  const close = () => navigate(-1);

  const { state } = useTasks();

  if (state.status !== "task") {
    return <LoadingPage />;
  }

  const task = state.currentTask.find((t) => t.id === taskId);

  return (
    <Modal onClose={close}>
      <ModalHeader title={task ? task.title : "Tarea"} onClose={close} />
      <ModalBody>
        {task ? <p>{task.title}</p> : <p>No se encontró la tarea.</p>}
      </ModalBody>
    </Modal>
  );
}

/**
 * "/calendar/:eid" — mismo criterio que TaskDetailModal.
 */
function EventDetailModal({ eventId }: { eventId: string }) {
  const navigate = useNavigate();
  const close = () => navigate(-1);

  const { state } = useEvents();
  if (state.status !== "events") {
    return <LoadingPage />;
  }
  const event = state.event.find((e) => e.id === eventId);

  return (
    <Modal onClose={close}>
      <ModalHeader title={event ? event.name : "Evento"} onClose={close} />
      <ModalBody>
        {event ? <p>{event.name}</p> : <p>No se encontró el evento.</p>}
      </ModalBody>
    </Modal>
  );
}
