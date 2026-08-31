import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useRef } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
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
import AddShared from "#components/templates/dialog/modShared/addShared";
import { usePanelRole } from "#features/invitations/presentation/hooks/usePanelRole";
/**
 * Único componente para toda la cadena `home/:pid[/:pid...]`. Antes había
 * una PanelsPage por cada combinación de rutas; ahora hay un solo switch
 * sobre `data.kind`, que viene ya resuelto por el loader.
 */
export default function PanelRoute() {
    const data = useLoaderData();
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
            return _jsx(PanelDashboard, { panel: data.panel, panels: data.panels });
        case "task-list":
            return (_jsx(PanelChrome, { panel: data.panel, panels: data.panels, viewLabel: "Tareas", viewIcon: "IconChecklist", children: _jsx(TaskListPage, { panel: data.panel }) }));
        case "task-detail":
            return (_jsxs(PanelChrome, { panel: data.panel, panels: data.panels, viewLabel: "Tareas", viewIcon: "IconChecklist", children: [_jsx(TaskListPage, { panel: data.panel }), _jsx(TaskDetailModal, { taskId: data.taskId })] }));
        case "calendar":
            return (_jsx(PanelChrome, { panel: data.panel, panels: data.panels, viewLabel: "Calendario", viewIcon: "IconCalendarEvent", children: _jsx(CalendarListPage, { panel: data.panel }) }));
        case "event-detail":
            return (_jsxs(PanelChrome, { panel: data.panel, panels: data.panels, viewLabel: "Calendario", viewIcon: "IconCalendarEvent", children: [_jsx(CalendarListPage, { panel: data.panel }), _jsx(EventDetailModal, { eventId: data.eventId })] }));
    }
}
/** Dashboard de widgets — el mismo componente que usaba HomePage/PanelsPage. */
function PanelDashboard({ panel, panels }) {
    const { signOut } = useAuth();
    const { state: widgetsState, toggleEditMode } = useWidgets();
    return (_jsxs(_Fragment, { children: [_jsx(PanelHeader, { panel: panel, onSignOut: signOut, leftAction: _jsx(EditModeButton, { editMode: widgetsState.editMode, onToggle: toggleEditMode }) }), _jsx(PanelLocationBar, { panels: panels }), _jsx(Dashboard, { widgetState: widgetsState })] }));
}
/** Header + wrapper común para las vistas de task-list/calendar (y sus detalles). */
function PanelChrome({ panel, panels, viewLabel, viewIcon, children, }) {
    const { signOut } = useAuth();
    return (_jsxs(_Fragment, { children: [_jsx(PanelHeader, { panel: panel, onSignOut: signOut }), _jsx(PanelLocationBar, { panels: panels, viewLabel: viewLabel, viewIcon: viewIcon }), children] }));
}
function PanelHeader({ panel, onSignOut, leftAction, }) {
    const headerRef = useRef(null);
    // Solo dueño/editor pueden compartir (Q3 + assertCanManageSharing en el
    // backend) — un VIEWER ni siquiera debería ver la opción.
    const panelRole = usePanelRole();
    const canShare = panelRole === "owner" || panelRole === "editor";
    useEffect(() => {
        headerRef.current?.style.setProperty("background-color", `hsl(${panel.color}, 100%, 20%)`);
    }, [panel.color]);
    const actions = [
        ...(leftAction
            ? [{ type: "children", children: leftAction }]
            : []),
        ...(canShare
            ? [
                {
                    type: "dropdown",
                    iconTrigger: "IconUserPlus",
                    options: [
                        {
                            icon: "IconMail",
                            label: "Invitar por correo",
                            portalModal: true,
                            render: (onClose) => (_jsx(AddShared, { type: "private", onClose: onClose })),
                        },
                        {
                            icon: "IconLink",
                            label: "Copiar enlace público",
                            portalModal: true,
                            render: (onClose) => (_jsx(AddShared, { type: "public", onClose: onClose })),
                        },
                    ],
                },
            ]
            : []),
        {
            type: "dropdown",
            iconTrigger: "IconUser",
            options: [
                {
                    icon: "IconSettings",
                    label: "Ajustes",
                    onClick: () => {
                        window.location.href = "/app/settings";
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
    return (_jsx(Header, { actions: actions, dateTimeItem: _jsx(DateTimeBadge, { onClick: () => { } }) }));
}
/**
 * "/task/:tid" — se pinta encima de la lista de tareas, nunca reemplaza la
 * página. Implementación mínima: solo muestra el título. El formulario de
 * edición completo queda fuera de alcance de este cambio de routing.
 */
function TaskDetailModal({ taskId }) {
    // Cerrar el modal = volver a la URL de la lista (quitar el /task/:tid final).
    const navigate = useNavigate();
    const close = () => navigate(-1);
    const { state } = useTasks();
    if (state.status !== "task") {
        return _jsx(LoadingPage, {});
    }
    const task = state.currentTask.find((t) => t.id === taskId);
    return (_jsxs(Modal, { onClose: close, children: [_jsx(ModalHeader, { title: task ? task.title : "Tarea", onClose: close }), _jsx(ModalBody, { children: task ? _jsx("p", { children: task.title }) : _jsx("p", { children: "No se encontr\u00F3 la tarea." }) })] }));
}
/**
 * "/calendar/:eid" — mismo criterio que TaskDetailModal.
 */
function EventDetailModal({ eventId }) {
    const navigate = useNavigate();
    const close = () => navigate(-1);
    const { state } = useEvents();
    if (state.status !== "events") {
        return _jsx(LoadingPage, {});
    }
    const event = state.event.find((e) => e.id === eventId);
    return (_jsxs(Modal, { onClose: close, children: [_jsx(ModalHeader, { title: event ? event.name : "Evento", onClose: close }), _jsx(ModalBody, { children: event ? _jsx("p", { children: event.name }) : _jsx("p", { children: "No se encontr\u00F3 el evento." }) })] }));
}
