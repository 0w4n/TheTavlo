import { describe, expect, it } from "vitest";
import { discoverWidgetDefinitions, widgetRegistry } from "./widgetDiscovery";

// Estos tests corren contra el discovery REAL (import.meta.glob sobre el
// filesystem del proyecto) — no contra un mock. Si mañana alguien agrega
// `features/pomodoro/components/templates/widget/PomodoroWidget.widget.meta.ts`,
// el test de "encuentra los widgets reales" debería seguir pasando sin
// tocarlo, y el widget nuevo aparecerá solo en `widgetRegistry.getAll()`.

describe("widgetDiscovery", () => {
  it("encuentra automáticamente los widgets ya migrados a sus Features", () => {
    const types = discoverWidgetDefinitions().map((d) => d.type);

    expect(types).toEqual(
      expect.arrayContaining([
        "task-list",
        "panels-list",
        "exam-timeline",
        "upcoming-deadlines",
        "dirty-note",
        "cooking-book",
      ]),
    );
  });

  it("no encuentra dos widgets con el mismo type (el registry no tuvo que descartar duplicados)", () => {
    const types = discoverWidgetDefinitions().map((d) => d.type);
    const unique = new Set(types);

    expect(unique.size).toBe(types.length);
  });

  it("cada widget descubierto trae la metadata mínima requerida", () => {
    for (const definition of discoverWidgetDefinitions()) {
      expect(definition.type).toBeTruthy();
      expect(definition.metadata.name).toBeTruthy();
      expect(definition.metadata.icon).toBeTruthy();
      expect(definition.metadata.category).toBeTruthy();
      expect(typeof definition.load).toBe("function");
    }
  });

  it("puebla el widgetRegistry singleton con lo que descubre", () => {
    for (const definition of discoverWidgetDefinitions()) {
      expect(widgetRegistry.has(definition.type)).toBe(true);
      expect(widgetRegistry.get(definition.type)).toBe(definition);
    }
  });

  it("un type que nadie registró no está en el registry", () => {
    expect(widgetRegistry.has("widget-que-no-existe")).toBe(false);
    expect(widgetRegistry.get("widget-que-no-existe")).toBeUndefined();
  });

  it("task-list declara su acción rápida (quickAdd) y exam-timeline no", () => {
    const taskList = widgetRegistry.get("task-list");
    const examTimeline = widgetRegistry.get("exam-timeline");

    expect(taskList?.quickAdd).toBeDefined();
    expect(examTimeline?.quickAdd).toBeUndefined();
  });
});
