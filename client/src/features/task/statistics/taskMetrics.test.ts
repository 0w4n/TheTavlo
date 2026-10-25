import { describe, expect, it } from "vitest";
import { TaskProgress, TaskSubmission } from "../domain/task.entity";
import {
  completionCounts,
  completionsByWeekday,
  completionsPerDay,
  dayIndex,
  deliveryStreaks,
  dueWithinDays,
  isOverdue,
  medianAnticipationDays,
  nextDeadlines,
  overdueSummary,
  punctualityCounts,
  statusBreakdown,
  wasLate,
  workloadByWeek,
} from "./taskMetrics";
import { NOW, at, doneTask, makeTask } from "./taskTestUtils";

describe("taskMetrics", () => {
  describe("fechas", () => {
    it("dayIndex resta a días enteros incluso en el cambio de horario", () => {
      // 29-mar-2026 es el cambio a horario de verano en Europa.
      const a = new Date(2026, 2, 28, 23, 30);
      const b = new Date(2026, 2, 29, 0, 30);
      const c = new Date(2026, 2, 30, 12, 0);

      expect(dayIndex(b) - dayIndex(a)).toBe(1);
      expect(dayIndex(c) - dayIndex(a)).toBe(2);
    });
  });

  describe("estado", () => {
    it("isOverdue: solo las NO entregadas con plazo pasado", () => {
      expect(isOverdue(makeTask({ due: at(-1) }), NOW)).toBe(true);
      expect(isOverdue(makeTask({ due: at(1) }), NOW)).toBe(false);
      expect(isOverdue(doneTask(-3, -2), NOW)).toBe(false);
    });

    it("statusBreakdown es excluyente: vencida gana a en curso / sin empezar", () => {
      const tasks = [
        doneTask(-1),
        makeTask({ due: at(-1) }), // sin empezar + vencida
        makeTask({ progress: TaskProgress.INPROGRESS, due: at(-2) }), // en curso + vencida
        makeTask({ progress: TaskProgress.INPROGRESS, due: at(2) }),
        makeTask({ due: at(5) }),
      ];

      expect(statusBreakdown(tasks, NOW)).toEqual({
        done: 1,
        overdue: 2,
        inProgress: 1,
        notStarted: 1,
      });
    });

    it("completionCounts cuenta entregadas sobre el total", () => {
      expect(completionCounts([doneTask(0), makeTask({ due: at(1) })])).toEqual({
        total: 2,
        done: 1,
      });
    });
  });

  describe("puntualidad", () => {
    it("wasLate respeta `submission` si viene informado", () => {
      const forcedLate = makeTask({
        progress: TaskProgress.SUBMITTED,
        due: at(5),
        doneAt: at(0),
        submission: TaskSubmission.LATE,
      });
      const forcedOnTime = makeTask({
        progress: TaskProgress.SUBMITTED,
        due: at(-5),
        doneAt: at(0),
        submission: TaskSubmission.ON_TIME,
      });

      expect(wasLate(forcedLate)).toBe(true);
      expect(wasLate(forcedOnTime)).toBe(false);
    });

    it("wasLate deduce comparando fechas cuando `submission` es null", () => {
      expect(wasLate(doneTask(0, 1))).toBe(false); // entregada un día antes
      expect(wasLate(doneTask(0, -1))).toBe(true); // entregada un día después
    });

    it("punctualityCounts ignora las no entregadas", () => {
      const tasks = [doneTask(0, 1), doneTask(0, -1), makeTask({ due: at(-3) })];

      expect(punctualityCounts(tasks)).toEqual({ done: 2, onTime: 1, late: 1 });
    });

    it("overdueSummary cuenta y mide la más antigua", () => {
      const tasks = [makeTask({ due: at(-1) }), makeTask({ due: at(-4) })];

      expect(overdueSummary(tasks, NOW)).toEqual({ count: 2, oldestDaysAgo: 4 });
      expect(overdueSummary([], NOW)).toEqual({ count: 0, oldestDaysAgo: null });
    });

    it("medianAnticipationDays usa la mediana (no se deja arrastrar por un outlier)", () => {
      // Antelaciones: 1, 2 y 30 días → mediana 2 (la media sería 11).
      const tasks = [doneTask(0, 1), doneTask(0, 2), doneTask(0, 30)];

      expect(medianAnticipationDays(tasks)).toBeCloseTo(2, 5);
    });

    it("medianAnticipationDays promedia los dos centrales si son pares", () => {
      expect(medianAnticipationDays([doneTask(0, 1), doneTask(0, 3)])).toBeCloseTo(2, 5);
    });

    it("medianAnticipationDays es null sin entregas y negativa si se entrega tarde", () => {
      expect(medianAnticipationDays([makeTask({ due: at(1) })])).toBeNull();
      expect(medianAnticipationDays([doneTask(0, -2)])).toBeCloseTo(-2, 5);
    });
  });

  describe("actividad", () => {
    it("completionsPerDay: [hace 6 días … hoy], ignora lo de hace 7 días o más", () => {
      const tasks = [
        doneTask(0),
        doneTask(0),
        doneTask(-1),
        doneTask(-6),
        doneTask(-7), // fuera de ventana
        makeTask({ due: at(1) }), // pendiente: no cuenta
      ];

      expect(completionsPerDay(tasks, NOW, 7)).toEqual([1, 0, 0, 0, 0, 1, 2]);
    });

    it("deliveryStreaks: racha actual y mejor racha", () => {
      const tasks = [0, -1, -2, -10, -11, -12, -13].map((d) => doneTask(d));

      expect(deliveryStreaks(tasks, NOW)).toEqual({ current: 3, best: 4 });
    });

    it("deliveryStreaks: sin entrega hoy, la racha de ayer sigue viva", () => {
      const tasks = [-1, -2].map((d) => doneTask(d));

      expect(deliveryStreaks(tasks, NOW)).toEqual({ current: 2, best: 2 });
    });

    it("deliveryStreaks: si pasó más de un día sin entregar, la actual es 0", () => {
      expect(deliveryStreaks([doneTask(-3)], NOW)).toEqual({ current: 0, best: 1 });
      expect(deliveryStreaks([], NOW)).toEqual({ current: 0, best: 0 });
    });

    it("deliveryStreaks: varias entregas el mismo día cuentan como un día", () => {
      expect(deliveryStreaks([doneTask(0), doneTask(0, 1, 9)], NOW)).toEqual({
        current: 1,
        best: 1,
      });
    });

    it("completionsByWeekday indexa con getDay() (0 = domingo)", () => {
      // NOW es domingo (0); at(-1) sábado (6); at(-2) viernes (5).
      const counts = completionsByWeekday([doneTask(0), doneTask(0), doneTask(-1), doneTask(-2)]);

      expect(counts[0]).toBe(2);
      expect(counts[6]).toBe(1);
      expect(counts[5]).toBe(1);
    });
  });

  describe("carga futura", () => {
    it("workloadByWeek agrupa en bloques de 7 días y excluye vencidas/entregadas", () => {
      const tasks = [
        makeTask({ due: at(0, 18) }), // hoy 18:00 → bloque 0
        makeTask({ due: at(6) }), // bloque 0
        makeTask({ due: at(7) }), // bloque 1
        makeTask({ due: at(20) }), // bloque 2
        makeTask({ due: at(40) }), // fuera de 4 semanas
        makeTask({ due: at(-1) }), // vencida → no cuenta
        makeTask({ due: at(0, 8) }), // hoy 08:00 (ya pasó) → vencida
        doneTask(0, 3), // entregada → no cuenta
      ];

      expect(workloadByWeek(tasks, NOW, 4)).toEqual([2, 1, 1, 0]);
    });

    it("dueWithinDays incluye hoy y llega hasta +6 días", () => {
      const tasks = [
        makeTask({ due: at(0, 18) }),
        makeTask({ due: at(6) }),
        makeTask({ due: at(7) }),
        makeTask({ due: at(-1) }),
      ];

      expect(dueWithinDays(tasks, NOW, 7)).toBe(2);
    });

    it("nextDeadlines ordena por cercanía, respeta el límite y salta vencidas/entregadas", () => {
      const tasks = [
        makeTask({ due: at(5), title: "c" }),
        makeTask({ due: at(1), title: "a" }),
        makeTask({ due: at(-1), title: "vencida" }),
        makeTask({ due: at(3), title: "b" }),
        doneTask(0, 2),
      ];

      expect(nextDeadlines(tasks, NOW, 2).map((t) => t.title)).toEqual(["a", "b"]);
    });
  });
});
