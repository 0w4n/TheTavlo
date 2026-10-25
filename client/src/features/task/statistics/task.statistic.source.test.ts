import { describe, expect, it } from "vitest";
import { TaskProgress } from "../domain/task.entity";
import taskSource from "./task.statistic.source";
import type { TaskStatisticsInput } from "./taskMetrics";
import type {
  StatisticContext,
  StatisticResult,
} from "#features/statistic/domain/statistic.types";
import { NOW, at, doneTask, makeTask } from "./taskTestUtils";

const ctx: StatisticContext = { now: NOW, locale: "es" };

function compute(id: string, tasks: TaskStatisticsInput["tasks"]): StatisticResult | null {
  const statistic = taskSource.statistics.find((s) => s.id === id);
  if (!statistic) throw new Error(`No existe la estadística ${id}`);
  return statistic.compute({ tasks }, ctx);
}

describe("fuente de estadísticas de tareas", () => {
  it("declara id, etiqueta y un hook de datos", () => {
    expect(taskSource.id).toBe("tasks");
    expect(taskSource.label).toBeTruthy();
    expect(typeof taskSource.useInput).toBe("function");
  });

  it("todos los ids son únicos, con prefijo `tasks.` y metadata completa", () => {
    const ids = taskSource.statistics.map((s) => s.id);

    expect(new Set(ids).size).toBe(ids.length);
    for (const s of taskSource.statistics) {
      expect(s.id.startsWith("tasks.")).toBe(true);
      expect(s.title).toBeTruthy();
      expect(s.description).toBeTruthy();
      expect(s.icon.startsWith("Icon")).toBe(true);
    }
  });

  it("sin tareas, ninguna estadística inventa datos (todas devuelven null)", () => {
    for (const s of taskSource.statistics) {
      expect(compute(s.id, [])).toBeNull();
    }
  });

  it("con datos mixtos, ninguna estadística lanza error", () => {
    const tasks = [
      doneTask(0, 1),
      doneTask(-1, -1),
      doneTask(-2, 3),
      makeTask({ progress: TaskProgress.INPROGRESS, due: at(2) }),
      makeTask({ due: at(-3) }),
      makeTask({ due: at(9) }),
    ];

    for (const s of taskSource.statistics) {
      expect(() => compute(s.id, tasks)).not.toThrow();
    }
  });

  it("tasks.completion-rate: anillo con porcentaje y tono", () => {
    const tasks = [doneTask(0), makeTask({ due: at(1) }), makeTask({ due: at(2) }), makeTask({ due: at(3) })];

    expect(compute("tasks.completion-rate", tasks)).toMatchObject({
      kind: "progress",
      value: 1,
      total: 4,
      label: "25%",
      tone: "warning",
      caption: "1 de 4 tareas entregadas",
    });
  });

  it("tasks.status-breakdown: 4 grupos con tonos semánticos", () => {
    const result = compute("tasks.status-breakdown", [doneTask(0), makeTask({ due: at(-1) })]);

    expect(result).toMatchObject({ kind: "distribution" });
    if (result?.kind !== "distribution") return;
    expect(result.slices.map((s) => [s.id, s.value, s.tone])).toEqual([
      ["done", 1, "positive"],
      ["inProgress", 0, "info"],
      ["notStarted", 0, "neutral"],
      ["overdue", 1, "danger"],
    ]);
  });

  it("tasks.on-time-rate: null si aún no hay entregas", () => {
    expect(compute("tasks.on-time-rate", [makeTask({ due: at(1) })])).toBeNull();
  });

  it("tasks.on-time-rate: 1 de 2 entregas a tiempo = 50%", () => {
    expect(compute("tasks.on-time-rate", [doneTask(0, 1), doneTask(0, -1)])).toMatchObject({
      kind: "kpi",
      value: "50%",
      tone: "info",
      caption: "1 de 2 entregas",
    });
  });

  it("tasks.overdue: cuenta y dice cuánto lleva la más antigua", () => {
    const result = compute("tasks.overdue", [makeTask({ due: at(-3) }), makeTask({ due: at(-1) })]);

    expect(result).toMatchObject({
      kind: "kpi",
      value: "2",
      unit: "tareas vencidas",
      tone: "danger",
      caption: "La más antigua venció hace 3 días",
    });
  });

  it("tasks.overdue: sin vencidas lo celebra (tono positivo, no vacío)", () => {
    expect(compute("tasks.overdue", [makeTask({ due: at(2) })])).toMatchObject({
      value: "0",
      tone: "positive",
      caption: "¡Estás al día!",
    });
  });

  it("tasks.typical-anticipation: días, horas y retraso", () => {
    expect(compute("tasks.typical-anticipation", [doneTask(0, 2)])).toMatchObject({
      value: "2",
      unit: "días antes del plazo",
      tone: "positive",
    });

    const halfDayEarly = makeTask({
      progress: TaskProgress.SUBMITTED,
      due: at(0, 12),
      doneAt: at(0, 0),
    });
    expect(compute("tasks.typical-anticipation", [halfDayEarly])).toMatchObject({
      value: "12",
      unit: "horas antes del plazo",
    });

    expect(compute("tasks.typical-anticipation", [doneTask(0, -3)])).toMatchObject({
      value: "3",
      unit: "días después del plazo",
      tone: "warning",
    });
  });

  it("tasks.completed-last-7-days: 7 barras, hoy resaltado; null sin entregas recientes", () => {
    const result = compute("tasks.completed-last-7-days", [doneTask(0), doneTask(0), doneTask(-2)]);

    expect(result?.kind).toBe("series");
    if (result?.kind !== "series") return;
    expect(result.points).toHaveLength(7);
    expect(result.points.map((p) => p.value)).toEqual([0, 0, 0, 0, 1, 0, 2]);
    expect(result.points.filter((p) => p.highlight)).toHaveLength(1);
    expect(result.points[6].highlight).toBe(true);
    expect(result.caption).toBe("3 entregas en los últimos 7 días");

    expect(compute("tasks.completed-last-7-days", [doneTask(-20)])).toBeNull();
  });

  it("tasks.weekly-comparison: tendencia contra la semana anterior", () => {
    const up = compute("tasks.weekly-comparison", [doneTask(0), doneTask(-1), doneTask(-8)]);
    expect(up).toMatchObject({
      value: "2",
      trend: { direction: "up", label: "+1 vs. semana anterior", tone: "positive" },
    });

    const down = compute("tasks.weekly-comparison", [doneTask(0), doneTask(-8), doneTask(-9), doneTask(-10)]);
    expect(down).toMatchObject({
      value: "1",
      trend: { direction: "down", label: "−2 vs. semana anterior", tone: "warning" },
    });

    const flat = compute("tasks.weekly-comparison", [doneTask(0), doneTask(-8)]);
    expect(flat).toMatchObject({ trend: { direction: "flat" } });

    expect(compute("tasks.weekly-comparison", [doneTask(-30)])).toBeNull();
  });

  it("tasks.streak: celebra la mejor racha y la recuerda si se perdió", () => {
    expect(compute("tasks.streak", [doneTask(0), doneTask(-1)])).toMatchObject({
      value: "2",
      unit: "días seguidos",
      tone: "positive",
      caption: "¡Es tu mejor racha!",
    });

    expect(compute("tasks.streak", [doneTask(-5), doneTask(-6), doneTask(-7)])).toMatchObject({
      value: "0",
      tone: "neutral",
      caption: "Tu mejor racha: 3 días",
    });
  });

  it("tasks.busiest-weekday: exige 3 entregas y desempata por el día más temprano de la semana", () => {
    expect(compute("tasks.busiest-weekday", [doneTask(0), doneTask(0)])).toBeNull();

    // NOW es domingo. 2 entregas el viernes (-2), 2 el sábado (-1), 1 el domingo.
    const tied = [doneTask(-2), doneTask(-2), doneTask(-1), doneTask(-1), doneTask(0)];
    expect(compute("tasks.busiest-weekday", tied)).toMatchObject({
      value: "Viernes",
      caption: "2 de 5 entregas",
    });
  });

  it("tasks.workload-next-weeks: resalta el bloque más cargado", () => {
    const tasks = [makeTask({ due: at(1) }), makeTask({ due: at(8) }), makeTask({ due: at(9) })];
    const result = compute("tasks.workload-next-weeks", tasks);

    expect(result?.kind).toBe("series");
    if (result?.kind !== "series") return;
    expect(result.points.map((p) => p.value)).toEqual([1, 2, 0, 0]);
    expect(result.points.map((p) => p.highlight)).toEqual([false, true, false, false]);
  });

  it("tasks.due-soon: tono según la cantidad", () => {
    expect(compute("tasks.due-soon", [makeTask({ due: at(20) })])).toMatchObject({
      value: "0",
      tone: "positive",
    });

    const many = Array.from({ length: 5 }, (_, i) => makeTask({ due: at(i + 1) }));
    expect(compute("tasks.due-soon", many)).toMatchObject({ value: "5", tone: "warning" });
  });

  it("tasks.next-deadlines: texto relativo y énfasis en lo inminente", () => {
    const result = compute("tasks.next-deadlines", [
      makeTask({ due: at(3), title: "Informe" }),
      makeTask({ due: at(0, 18), title: "Hoy" }),
      makeTask({ due: at(1), title: "Mañana" }),
    ]);

    expect(result?.kind).toBe("list");
    if (result?.kind !== "list") return;
    expect(result.items.map((i) => [i.label, i.value, i.tone])).toEqual([
      ["Hoy", "hoy", "warning"],
      ["Mañana", "mañana", "warning"],
      ["Informe", "en 3 días", "neutral"],
    ]);
  });
});
