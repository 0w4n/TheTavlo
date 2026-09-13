import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { WidgetRegistry } from "#features/widgets/domain/widgetRegistry";
import type { WidgetComponentProps } from "#features/widgets/domain/widgetDefinition.types";

// Registro de prueba, aislado del registry real poblado por
// import.meta.glob — así este test no depende de qué widgets existan hoy
// en las Features.
const testRegistry = new WidgetRegistry();

vi.mock("#core/widgets/infraestructure/widgetDiscovery", () => ({
  widgetRegistry: testRegistry,
}));

const { default: WidgetRenderer } = await import("./WidgetRenderer");

describe("WidgetRenderer", () => {
  it("renderiza el componente del widget registrado para ese type", async () => {
    testRegistry.register({
      type: "renderer-test-ok",
      metadata: {
        name: "OK",
        description: "",
        icon: "IconWidget",
        category: "other",
      },
      load: async () => ({
        default: () => <div>Contenido del widget</div>,
      }),
    });

    render(
      <WidgetRenderer type="renderer-test-ok" widgetId="w1" config={{}} />,
    );

    await waitFor(() =>
      expect(screen.getByText("Contenido del widget")).toBeInTheDocument(),
    );
  });

  it("pasa widgetId/panelId/config al componente del widget", async () => {
    testRegistry.register({
      type: "renderer-test-props",
      metadata: {
        name: "Props",
        description: "",
        icon: "IconWidget",
        category: "other",
      },
      load: async () => ({
        default: ({ widgetId, panelId, config }: WidgetComponentProps) => (
          <div>
            {widgetId}-{panelId}-{JSON.stringify(config)}
          </div>
        ),
      }),
    });

    render(
      <WidgetRenderer
        type="renderer-test-props"
        widgetId="w2"
        panelId="p1"
        config={{ foo: "bar" }}
      />,
    );

    await waitFor(() =>
      expect(screen.getByText('w2-p1-{"foo":"bar"}')).toBeInTheDocument(),
    );
  });

  it("muestra un fallback en vez de romper cuando el type no está registrado", () => {
    render(
      <WidgetRenderer type="tipo-que-no-existe" widgetId="w3" config={{}} />,
    );

    expect(
      screen.getByText(/tipo-que-no-existe.*ya no está disponible/i),
    ).toBeInTheDocument();
  });

  it("muestra el skeleton mientras el chunk del widget todavía está cargando", async () => {
    let resolveLoad!: (mod: { default: () => React.JSX.Element }) => void;
    const pending = new Promise<{ default: () => React.JSX.Element }>(
      (resolve) => {
        resolveLoad = resolve;
      },
    );

    testRegistry.register({
      type: "renderer-test-loading",
      metadata: {
        name: "Loading",
        description: "",
        icon: "IconWidget",
        category: "other",
      },
      load: () => pending,
    });

    render(
      <WidgetRenderer
        type="renderer-test-loading"
        widgetId="w4"
        config={{}}
      />,
    );

    expect(screen.getByRole("status", { name: /cargando widget/i })).toBeInTheDocument();

    resolveLoad({ default: () => <div>Ya cargó</div> });

    await waitFor(() =>
      expect(screen.getByText("Ya cargó")).toBeInTheDocument(),
    );
  });
});
