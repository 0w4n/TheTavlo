import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
// ─── Mocks — el foco de este test es CUÁNDO se abren los modales según los
// query params de la URL, no el contenido visual de Header/Dashboard/Rise. ─
vi.mock("#core/auth/presentation/hooks/useAuth", () => ({
    default: () => ({ signOut: vi.fn() }),
}));
vi.mock("#features/widgets/presentation/hooks/useWidgets", () => ({
    default: () => ({
        state: { editMode: false, widgets: [] },
        toggleEditMode: vi.fn(),
    }),
}));
vi.mock("#components/organisms/dashboard/dashboard", () => ({
    Dashboard: () => _jsx("div", { "data-testid": "dashboard", children: "Dashboard" }),
}));
vi.mock("#components/organisms/header", () => ({
    Header: () => _jsx("header", { "data-testid": "header" }),
}));
vi.mock("#components/molecules/toolbar/toolBar", () => ({
    EditModeButton: () => _jsx("button", { children: "EditMode" }),
}));
vi.mock("#components/atoms/datetimebadge", () => ({
    DateTimeBadge: () => _jsx("div", { children: "DateTimeBadge" }),
}));
vi.mock("#components/molecules/rise", () => ({
    Rise: () => _jsx("div", { "data-testid": "rise" }),
}));
vi.mock("#components/molecules/modal", () => ({
    Modal: ({ children, onClose, }) => (_jsxs("div", { "data-testid": "modal", children: [_jsx("button", { onClick: onClose, children: "cerrar" }), children] })),
    ModalHeader: ({ title }) => (_jsx("h2", { "data-testid": "modal-title", children: title })),
    ModalBody: ({ children }) => (_jsx("div", { children: children })),
}));
vi.mock("#features/panels/presentation/hooks/usePanels", () => ({
    default: () => ({
        fetchHomePanel: vi.fn().mockResolvedValue(undefined),
    }),
}));
vi.mock("#features/invitations/presentation/hooks/usePanelRole", () => ({
    usePanelRole: () => "owner",
}));
vi.mock("#features/onBoarding/presentation/hooks/useOnBoardingBootstrap", () => ({
    useOnBoardingBootstrap: () => { },
}));
vi.mock("#core/routing/useDocumentTitle", () => ({
    useDocumentTitle: vi.fn(),
}));
const { default: HomePage } = await import("./HomePage");
function renderHomePage(initialEntry) {
    return render(_jsx(MemoryRouter, { initialEntries: [initialEntry], children: _jsx(HomePage, {}) }));
}
describe("HomePage — modales especiales según query params", () => {
    it("sin query params: no muestra ningún modal, sí el dashboard", () => {
        renderHomePage("/home");
        expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
        expect(screen.getByTestId("dashboard")).toBeInTheDocument();
    });
    it("?openModal=task-needs-panel: abre el modal de 'elegí un panel' (caso home/task)", async () => {
        renderHomePage("/home?openModal=task-needs-panel");
        await waitFor(() => expect(screen.getByTestId("modal")).toBeInTheDocument());
        expect(screen.getByTestId("modal-title")).toHaveTextContent("Elegí un panel");
    });
    it("cerrar el modal de 'elegí un panel' lo saca de pantalla", async () => {
        renderHomePage("/home?openModal=task-needs-panel");
        await waitFor(() => expect(screen.getByTestId("modal")).toBeInTheDocument());
        fireEvent.click(screen.getByText("cerrar"));
        await waitFor(() => expect(screen.queryByTestId("modal")).not.toBeInTheDocument());
    });
    it("?invalidPanel=1: abre el aviso de panel inválido/borrado", async () => {
        renderHomePage("/home?invalidPanel=1");
        await waitFor(() => expect(screen.getByTestId("modal")).toBeInTheDocument());
        expect(screen.getByTestId("modal-title")).toHaveTextContent("Ese panel ya no existe");
    });
    it("cerrar el aviso de panel inválido lo saca de pantalla", async () => {
        renderHomePage("/home?invalidPanel=1");
        await waitFor(() => expect(screen.getByTestId("modal")).toBeInTheDocument());
        fireEvent.click(screen.getByText("cerrar"));
        await waitFor(() => expect(screen.queryByTestId("modal")).not.toBeInTheDocument());
    });
    it("el dashboard sigue montado debajo de cualquiera de los dos modales", async () => {
        renderHomePage("/home?openModal=task-needs-panel");
        await waitFor(() => expect(screen.getByTestId("modal")).toBeInTheDocument());
        expect(screen.getByTestId("dashboard")).toBeInTheDocument();
    });
});
