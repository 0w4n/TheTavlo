import { describe, it, expect } from "vitest";
import { parsePanelPath, buildPanelPath, activePanelId } from "./panelPath";

describe("parsePanelPath", () => {
  it("rechaza splat vacío o ausente (home/task, home a secas vía este parser)", () => {
    expect(parsePanelPath(undefined)).toEqual({ ok: false, reason: "no-panel" });
    expect(parsePanelPath("")).toEqual({ ok: false, reason: "no-panel" });
    expect(parsePanelPath("task")).toEqual({ ok: false, reason: "no-panel" });
    expect(parsePanelPath("calendar")).toEqual({ ok: false, reason: "no-panel" });
  });

  it("home/:pid", () => {
    expect(parsePanelPath("abc")).toEqual({
      ok: true,
      path: { panelIds: ["abc"], view: { type: "dashboard" } },
    });
  });

  it("home/:pid/task", () => {
    expect(parsePanelPath("abc/task")).toEqual({
      ok: true,
      path: { panelIds: ["abc"], view: { type: "task-list" } },
    });
  });

  it("home/:pid/task/:tid", () => {
    expect(parsePanelPath("abc/task/t1")).toEqual({
      ok: true,
      path: { panelIds: ["abc"], view: { type: "task-detail", taskId: "t1" } },
    });
  });

  it("home/:pid/calendar", () => {
    expect(parsePanelPath("abc/calendar")).toEqual({
      ok: true,
      path: { panelIds: ["abc"], view: { type: "calendar" } },
    });
  });

  it("home/:pid/calendar/:eid", () => {
    expect(parsePanelPath("abc/calendar/e1")).toEqual({
      ok: true,
      path: { panelIds: ["abc"], view: { type: "event-detail", eventId: "e1" } },
    });
  });

  it("home/:pid/:pid", () => {
    expect(parsePanelPath("abc/def")).toEqual({
      ok: true,
      path: { panelIds: ["abc", "def"], view: { type: "dashboard" } },
    });
  });

  it("home/:pid/:pid/task", () => {
    expect(parsePanelPath("abc/def/task")).toEqual({
      ok: true,
      path: { panelIds: ["abc", "def"], view: { type: "task-list" } },
    });
  });

  it("home/:pid/:pid/task/:tid", () => {
    expect(parsePanelPath("abc/def/task/t1")).toEqual({
      ok: true,
      path: { panelIds: ["abc", "def"], view: { type: "task-detail", taskId: "t1" } },
    });
  });

  it("home/:pid/:pid/calendar", () => {
    expect(parsePanelPath("abc/def/calendar")).toEqual({
      ok: true,
      path: { panelIds: ["abc", "def"], view: { type: "calendar" } },
    });
  });

  it("home/:pid/:pid/calendar/:eid", () => {
    expect(parsePanelPath("abc/def/calendar/e1")).toEqual({
      ok: true,
      path: { panelIds: ["abc", "def"], view: { type: "event-detail", eventId: "e1" } },
    });
  });

  it("home/:pid/:pid/:pid (3 niveles, y por extensión N niveles)", () => {
    expect(parsePanelPath("abc/def/ghi")).toEqual({
      ok: true,
      path: { panelIds: ["abc", "def", "ghi"], view: { type: "dashboard" } },
    });
  });

  it("home/:pid/:pid/:pid/task", () => {
    expect(parsePanelPath("abc/def/ghi/task")).toEqual({
      ok: true,
      path: { panelIds: ["abc", "def", "ghi"], view: { type: "task-list" } },
    });
  });

  it("home/:pid/:pid/:pid/task/:tid", () => {
    expect(parsePanelPath("abc/def/ghi/task/t1")).toEqual({
      ok: true,
      path: { panelIds: ["abc", "def", "ghi"], view: { type: "task-detail", taskId: "t1" } },
    });
  });

  it("home/:pid/:pid/:pid/calendar", () => {
    expect(parsePanelPath("abc/def/ghi/calendar")).toEqual({
      ok: true,
      path: { panelIds: ["abc", "def", "ghi"], view: { type: "calendar" } },
    });
  });

  it("home/:pid/:pid/:pid/calendar/:eid", () => {
    expect(parsePanelPath("abc/def/ghi/calendar/e1")).toEqual({
      ok: true,
      path: { panelIds: ["abc", "def", "ghi"], view: { type: "event-detail", eventId: "e1" } },
    });
  });

  it("5 niveles de anidamiento también funcionan (no hay límite fijo)", () => {
    const result = parsePanelPath("a/b/c/d/e/task/t1");
    expect(result).toEqual({
      ok: true,
      path: { panelIds: ["a", "b", "c", "d", "e"], view: { type: "task-detail", taskId: "t1" } },
    });
  });

  it("todo lo que sigue a task/calendar es el id, no otro :pid — un solo id permitido", () => {
    // "def" acá es el taskId, no un panel — la gramática no permite :pid después de task/calendar
    expect(parsePanelPath("abc/task/def")).toEqual({
      ok: true,
      path: { panelIds: ["abc"], view: { type: "task-detail", taskId: "def" } },
    });
    // 3 segmentos después del keyword ya no matchea ningún caso válido
    expect(parsePanelPath("abc/task/t1/extra")).toEqual({ ok: false, reason: "malformed" });
    expect(parsePanelPath("abc/calendar/e1/extra")).toEqual({ ok: false, reason: "malformed" });
  });

  it("un segmento que no es 'task' ni 'calendar' es simplemente otro :pid anidado (no hay whitelist de keywords)", () => {
    // Corrige una aserción previa que esperaba "malformed" acá: la gramática
    // documentada en este archivo solo reserva "task" y "calendar" — todo lo
    // demás son ids de panel legítimos, sin importar qué texto tengan.
    expect(parsePanelPath("abc/widgets")).toEqual({
      ok: true,
      path: { panelIds: ["abc", "widgets"], view: { type: "dashboard" } },
    });
  });

  it("ignora barras finales/dobles", () => {
    expect(parsePanelPath("abc/def/")).toEqual(parsePanelPath("abc/def"));
    expect(parsePanelPath("abc//def")).toEqual(parsePanelPath("abc/def"));
  });
});

describe("buildPanelPath", () => {
  it("arma el dashboard de un panel", () => {
    expect(buildPanelPath(["abc"])).toBe("/home/abc");
  });

  it("arma la lista de tareas de un panel anidado", () => {
    expect(buildPanelPath(["abc", "def"], { type: "task-list" })).toBe("/home/abc/def/task");
  });

  it("arma el detalle de una tarea", () => {
    expect(buildPanelPath(["abc"], { type: "task-detail", taskId: "t1" })).toBe(
      "/home/abc/task/t1",
    );
  });

  it("arma el calendario y el detalle de un evento", () => {
    expect(buildPanelPath(["abc", "def", "ghi"], { type: "calendar" })).toBe(
      "/home/abc/def/ghi/calendar",
    );
    expect(
      buildPanelPath(["abc", "def", "ghi"], { type: "event-detail", eventId: "e1" }),
    ).toBe("/home/abc/def/ghi/calendar/e1");
  });

  it("lanza si se llama sin panelIds — 'volver a home' no pasa por acá", () => {
    expect(() => buildPanelPath([])).toThrow();
  });

  it("es la inversa exacta de parsePanelPath para cualquier PanelPath válido", () => {
    const cases: Array<[string[], Parameters<typeof buildPanelPath>[1]]> = [
      [["a"], { type: "dashboard" }],
      [["a", "b"], { type: "task-list" }],
      [["a", "b", "c"], { type: "task-detail", taskId: "t1" }],
      [["a"], { type: "calendar" }],
      [["a", "b"], { type: "event-detail", eventId: "e1" }],
    ];

    for (const [panelIds, view] of cases) {
      const url = buildPanelPath(panelIds, view);
      const splat = url.replace(/^\/home\//, "");
      const parsed = parsePanelPath(splat);
      expect(parsed).toEqual({ ok: true, path: { panelIds, view } });
    }
  });
});

describe("activePanelId", () => {
  it("devuelve siempre el último :pid de la cadena", () => {
    expect(activePanelId({ panelIds: ["a"], view: { type: "dashboard" } })).toBe("a");
    expect(activePanelId({ panelIds: ["a", "b", "c"], view: { type: "task-list" } })).toBe("c");
  });
});
