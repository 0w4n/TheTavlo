import { describe, expect, it } from "vitest";
import { DuplicateWidgetTypeError, WidgetRegistry } from "./widgetRegistry";
import type { WidgetDefinition } from "./widgetDefinition.types";

function makeDefinition(type: string): WidgetDefinition {
  return {
    type,
    metadata: {
      name: type,
      description: `Widget de prueba: ${type}`,
      icon: "IconWidget",
      category: "other",
    },
    load: async () => ({ default: () => null }),
  };
}

describe("WidgetRegistry", () => {
  it("registra un widget y lo puede recuperar por tipo", () => {
    const registry = new WidgetRegistry();
    const definition = makeDefinition("task-list");

    registry.register(definition);

    expect(registry.get("task-list")).toBe(definition);
  });

  it("has() refleja correctamente si un tipo está registrado", () => {
    const registry = new WidgetRegistry();
    registry.register(makeDefinition("notes"));

    expect(registry.has("notes")).toBe(true);
    expect(registry.has("no-existe")).toBe(false);
  });

  it("get() de un tipo inexistente devuelve undefined, no lanza", () => {
    const registry = new WidgetRegistry();
    expect(registry.get("fantasma")).toBeUndefined();
  });

  it("getAll() devuelve todos los widgets registrados", () => {
    const registry = new WidgetRegistry();
    registry.register(makeDefinition("task-list"));
    registry.register(makeDefinition("notes"));

    const all = registry.getAll();
    expect(all).toHaveLength(2);
    expect(all.map((d) => d.type).sort()).toEqual(["notes", "task-list"]);
  });

  it("getAll() en un registro vacío devuelve un arreglo vacío", () => {
    const registry = new WidgetRegistry();
    expect(registry.getAll()).toEqual([]);
  });

  it("lanza DuplicateWidgetTypeError al registrar dos widgets con el mismo type", () => {
    const registry = new WidgetRegistry();
    registry.register(makeDefinition("task-list"));

    expect(() => registry.register(makeDefinition("task-list"))).toThrow(
      DuplicateWidgetTypeError,
    );
  });

  it("el mensaje de error de duplicado menciona el type en conflicto", () => {
    const registry = new WidgetRegistry();
    registry.register(makeDefinition("task-list"));

    expect(() => registry.register(makeDefinition("task-list"))).toThrow(
      /task-list/,
    );
  });

  it("no muta el registro cuando el registro duplicado falla", () => {
    const registry = new WidgetRegistry();
    const original = makeDefinition("task-list");
    registry.register(original);

    try {
      registry.register(makeDefinition("task-list"));
    } catch {
      // esperado
    }

    expect(registry.get("task-list")).toBe(original);
    expect(registry.getAll()).toHaveLength(1);
  });
});
