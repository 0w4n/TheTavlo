import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { forwardRef } from "react";
const now = {};
function makePanel(id) {
    return {
        id,
        parentId: null,
        name: id,
        color: 200,
        icon: "",
        sharedWith: null,
        createdAt: now,
        updatedAt: now,
    };
}
// ─── Mocks de hooks de contexto — PanelRoute los consume directamente y no
// nos interesa ejercitar sus providers reales acá, solo la lógica propia
// del componente (qué vista monta según data.kind). ────────────────────────
const { selectPanelMock, signOutMock } = vi.hoisted(() => ({
    selectPanelMock: vi.fn(),
    signOutMock: vi.fn(),
}));
vi.mock("#core/auth/presentation/hooks/useAuth", () => ({
    default: () => ({ signOut: signOutMock }),
}));
vi.mock("#features/panels/presentation/hooks/usePanels", () => ({
    default: () => ({ selectPanel: selectPanelMock }),
}));
vi.mock("#features/widgets/presentation/hooks/useWidgets", () => ({
    default: () => ({
        state: { editMode: false, widgets: [] },
        toggleEditMode: vi.fn(),
    }),
}));
vi.mock("#features/task/presentation/hooks/useTask", () => ({
    default: () => ({
        state: {
            status: "task",
            currentTask: [{ id: "task-1", title: "Comprar café" }],
        },
    }),
}));
vi.mock("#features/invitations/presentation/hooks/usePanelRole", () => ({
    usePanelRole: () => "owner",
}));
vi.mock("#features/events/presentation/hooks/useEvents", () => ({
    useEvents: () => ({
        state: {
            status: "events",
            event: [{ id: "evt-1", name: "Reunión de equipo" }],
        },
    }),
}));
// ─── Mocks de componentes visuales — evitan arrastrar íconos/estilos reales,
// el foco del test es el switch de PanelRoute, no estos componentes. ───────
vi.mock("#components/organisms/dashboard/dashboard", () => ({
    Dashboard: () => _jsx("div", { "data-testid": "dashboard", children: "Dashboard" }),
}));
vi.mock("#components/organisms/header", () => ({
    Header: forwardRef((_props, ref) => (_jsx("header", { "data-testid": "header", ref: ref }))),
}));
vi.mock("#components/organisms/panelLocationBar/panelLocationBar", () => ({
    default: () => _jsx("div", { "data-testid": "panel-location-bar" }),
}));
vi.mock("#components/molecules/toolbar/toolBar", () => ({
    EditModeButton: () => _jsx("button", { children: "EditMode" }),
}));
vi.mock("#components/atoms/datetimebadge", () => ({
    DateTimeBadge: () => _jsx("div", { children: "DateTimeBadge" }),
}));
vi.mock("#components/molecules/modal", () => ({
    Modal: ({ children, onClose, }) => (_jsxs("div", { "data-testid": "modal", children: [_jsx("button", { onClick: onClose, children: "cerrar" }), children] })),
    ModalHeader: ({ title }) => (_jsx("h2", { "data-testid": "modal-title", children: title })),
    ModalBody: ({ children }) => (_jsx("div", { children: children })),
}));
vi.mock("./TaskListPage", () => ({
    default: ({ panel }) => (_jsxs("div", { "data-testid": "task-list-page", children: ["TaskListPage:", panel.id] })),
}));
vi.mock("#features/events/components/pages/CalendarListPage", () => ({
    default: ({ panel }) => (_jsxs("div", { "data-testid": "calendar-page", children: ["CalendarListPage:", panel.id] })),
}));
vi.mock("./LoadingPage", () => ({
    default: () => _jsx("div", { "data-testid": "loading-page", children: "Loading..." }),
}));
vi.mock("#features/events/components/pages/CalendarPage", () => ({
    default: () => _jsx("div", { "data-testid": "calendar-view", children: "Calendar View" }),
}));
vi.mock("#components/templates/dialog/modShared/addShared", () => ({
    default: () => _jsx("div", { "data-testid": "add-shared", children: "Add Shared" }),
}));
// Importado DESPUÉS de los vi.mock — así usa las versiones mockeadas.
const { default: PanelRoute } = await import("./PanelRoute");
function renderWithLoaderData(data) {
    const router = createMemoryRouter([{ path: "/panel", element: _jsx(PanelRoute, {}), loader: () => data }], { initialEntries: ["/panel"] });
    return render(_jsx(RouterProvider, { router: router }));
}
describe("PanelRoute — monta la vista correcta según data.kind", () => {
    it("kind: 'dashboard' → renderiza el Dashboard y selecciona el panel activo", async () => {
        const panel = makePanel("panel-a");
        renderWithLoaderData({ kind: "dashboard", panels: [panel], panel });
        await waitFor(() => expect(screen.getByTestId("dashboard")).toBeInTheDocument());
        expect(selectPanelMock).toHaveBeenCalledWith(panel);
    });
    it("kind: 'task-list' → renderiza TaskListPage con el último panel de la cadena", async () => {
        const panel = makePanel("panel-b");
        renderWithLoaderData({ kind: "task-list", panels: [panel], panel });
        await waitFor(() => expect(screen.getByTestId("task-list-page")).toHaveTextContent("panel-b"));
    });
    it("kind: 'calendar' → renderiza CalendarListPage con el último panel de la cadena", async () => {
        const panel = makePanel("panel-c");
        renderWithLoaderData({ kind: "calendar", panels: [panel], panel });
        await waitFor(() => expect(screen.getByTestId("calendar-page")).toHaveTextContent("panel-c"));
    });
    it("kind: 'task-detail' → muestra la lista de tareas Y el modal con la tarea encontrada", async () => {
        const panel = makePanel("panel-d");
        renderWithLoaderData({
            kind: "task-detail",
            panels: [panel],
            panel,
            taskId: "task-1",
        });
        await waitFor(() => expect(screen.getByTestId("task-list-page")).toBeInTheDocument());
        expect(screen.getByTestId("modal")).toBeInTheDocument();
        expect(screen.getByTestId("modal-title")).toHaveTextContent("Comprar café");
    });
    it("kind: 'task-detail' con un taskId inexistente muestra el modal con fallback", async () => {
        const panel = makePanel("panel-e");
        renderWithLoaderData({
            kind: "task-detail",
            panels: [panel],
            panel,
            taskId: "no-existe",
        });
        await waitFor(() => expect(screen.getByTestId("modal-title")).toHaveTextContent("Tarea"));
    });
    it("kind: 'event-detail' → muestra el calendario Y el modal con el evento encontrado", async () => {
        const panel = makePanel("panel-f");
        renderWithLoaderData({
            kind: "event-detail",
            panels: [panel],
            panel,
            eventId: "evt-1",
        });
        await waitFor(() => expect(screen.getByTestId("calendar-page")).toBeInTheDocument());
        expect(screen.getByTestId("modal-title")).toHaveTextContent("Reunión de equipo");
    });
    it("cerrar el modal de detalle de tarea no rompe el render", async () => {
        const panel = makePanel("panel-g");
        renderWithLoaderData({
            kind: "task-detail",
            panels: [panel],
            panel,
            taskId: "task-1",
        });
        await waitFor(() => expect(screen.getByTestId("modal")).toBeInTheDocument());
        fireEvent.click(screen.getByText("cerrar"));
        // navigate(-1) en un MemoryRouter sin historial previo no debería tirar.
    });
});
