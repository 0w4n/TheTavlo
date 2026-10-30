import { describe, expect, it } from "vitest";
import { detectConflicts, resolveWeek as resolveWeekPure } from "../../domain/scheduleResolver";
import { dateToWeekNumber } from "../../domain/weekMath";
import { buildScheduleSeed } from "../__fixtures__/scheduleSeed";
import {
  buildAgenda,
  clipToSchedulePeriod,
  computeAttendance,
  computeGridRange,
  findUpcoming,
  formatDuration,
  formatMinute,
  getInstancesOn,
  getVisibleDays,
  layoutDayBlocks,
  relativeDayLabel,
} from "./scheduleSelectors";

const seed = buildScheduleSeed();
const activeSubjects = seed.subjects.filter((s) => !s.isArchived);

// Misma cadena que ScheduleProvider.resolveWeek: resolver + conflictos + recorte.
const resolveWeek = (week: number) =>
  clipToSchedulePeriod(
    seed.schedule,
    detectConflicts(
      resolveWeekPure({
        schedule: seed.schedule,
        subjects: activeSubjects,
        slots: seed.slots,
        exceptions: seed.exceptions,
        attendance: seed.attendance,
        week,
      }),
    ),
  );

const monday = new Date(2026, 9, 26);

describe("formato", () => {
  it("formatMinute / formatDuration", () => {
    expect(formatMinute(9 * 60 + 5)).toBe("09:05");
    expect(formatDuration(45)).toBe("45 min");
    expect(formatDuration(120)).toBe("2 h");
    expect(formatDuration(135)).toBe("2 h 15 min");
  });

  it("relativeDayLabel", () => {
    expect(relativeDayLabel(monday, monday)).toBe("hoy");
    expect(relativeDayLabel(new Date(2026, 9, 27), monday)).toBe("mañana");
    expect(relativeDayLabel(new Date(2026, 9, 29), monday)).toBe("el jueves");
    expect(relativeDayLabel(new Date(2026, 10, 9), monday)).toBe("el lunes 9");
  });
});

describe("getInstancesOn", () => {
  it("el lunes 26 oct hay 4 clases y la archivada no aparece", () => {
    const list = getInstancesOn(resolveWeek, seed.schedule, monday);
    expect(list.map((i) => i.slotGroupId)).toEqual([
      "g-alg-mon",
      "g-calc-mon",
      "g-ing-mon",
      "g-prog-lab",
    ]);
  });

  it("marca el solape entre Cálculo e Inglés (tutoría)", () => {
    const list = getInstancesOn(resolveWeek, seed.schedule, monday);
    const conflicted = list.filter((i) => i.hasConflict).map((i) => i.slotGroupId);
    expect(conflicted).toEqual(["g-calc-mon", "g-ing-mon"]);
  });

  it("devuelve la clase cancelada con isCancelled", () => {
    const [fis] = getInstancesOn(resolveWeek, seed.schedule, new Date(2026, 9, 27));
    expect(fis.slotGroupId).toBe("g-fis-tue");
    expect(fis.isCancelled).toBe(true);
  });

  it("aplica el override de aula del miércoles", () => {
    const [alg] = getInstancesOn(resolveWeek, seed.schedule, new Date(2026, 9, 28));
    expect(alg.room).toBe("A0.12");
    expect(alg.isException).toBe(true);
  });

  it("un festivo no produce clases (2 nov)", () => {
    expect(getInstancesOn(resolveWeek, seed.schedule, new Date(2026, 10, 2))).toEqual([]);
  });

  it("fuera del periodo no hay clases", () => {
    expect(getInstancesOn(resolveWeek, seed.schedule, new Date(2026, 8, 1))).toEqual([]);
    expect(getInstancesOn(resolveWeek, seed.schedule, new Date(2027, 1, 15))).toEqual([]);
  });
});

describe("buildAgenda", () => {
  const today = getInstancesOn(resolveWeek, seed.schedule, monday);

  it("clasifica done / ongoing / upcoming a las 11:20", () => {
    const agenda = buildAgenda(today, new Date(2026, 9, 26, 11, 20));
    expect(agenda.map((a) => a.phase)).toEqual(["done", "ongoing", "upcoming", "upcoming"]);
  });

  it("calcula progreso y minutos restantes de la clase en curso", () => {
    const [, calc] = buildAgenda(today, new Date(2026, 9, 26, 11, 45));
    expect(calc.progress).toBeCloseTo(0.5, 5); // 45 de 90 min
    expect(calc.minutesUntilEnd).toBe(45);
  });
});

describe("findUpcoming", () => {
  it("separa la clase en curso de las siguientes", () => {
    const { current, next } = findUpcoming(
      resolveWeek,
      seed.schedule,
      new Date(2026, 9, 26, 11, 20),
      3,
    );
    expect(current?.slotGroupId).toBe("g-calc-mon");
    expect(next.map((i) => i.slotGroupId)).toEqual(["g-ing-mon", "g-prog-lab", "g-ing-tue"]);
  });

  it("salta las canceladas (la Física del martes 27)", () => {
    const { next } = findUpcoming(resolveWeek, seed.schedule, new Date(2026, 9, 26, 18), 2);
    expect(next[0].slotGroupId).toBe("g-ing-tue");
  });

  it("cruza al festivo y a la semana siguiente", () => {
    const { next } = findUpcoming(resolveWeek, seed.schedule, new Date(2026, 9, 30, 18), 1);
    // lunes 2 nov es festivo → la siguiente es el martes 3
    expect(next[0].date.toDate().getDate()).toBe(3);
  });

  it("después del fin del periodo no queda nada", () => {
    const r = findUpcoming(resolveWeek, seed.schedule, new Date(2027, 2, 1), 3);
    expect(r.current).toBeNull();
    expect(r.next).toEqual([]);
  });
});

describe("computeAttendance", () => {
  const now = new Date(2026, 9, 26, 11, 20);
  const summary = computeAttendance(resolveWeek, seed.schedule, activeSubjects, now, 0.8);

  it("cuenta solo clases ya terminadas y no canceladas", () => {
    // Semana 7: solo Álgebra (09:00–10:30) ha terminado a las 11:20.
    const alg = summary.bySubject.find((s) => s.subjectId === "subj-alg")!;
    expect(alg.present).toBeGreaterThan(0);
    expect(summary.bySubject.find((s) => s.subjectId === "subj-old")).toBeUndefined();
  });

  it("los totales cuadran: held = present + late + absent + unmarked", () => {
    for (const row of [...summary.bySubject, summary.overall]) {
      expect(row.held).toBe(row.present + row.late + row.absent + row.unmarked);
    }
  });

  it("Cálculo queda por debajo del umbral y sale el primero", () => {
    expect(summary.bySubject[0].subjectId).toBe("subj-calc");
    expect(summary.bySubject[0].belowThreshold).toBe(true);
  });

  it("un retraso cuenta como asistencia", () => {
    const row = summary.bySubject.find((s) => s.late > 0)!;
    const expected = (row.present + row.late) / (row.present + row.late + row.absent);
    expect(row.rate).toBeCloseTo(expected, 6);
  });
});

describe("parrilla semanal", () => {
  it("el rango cubre de 09:00 a 18:00 y es estable", () => {
    const range = computeGridRange(seed.slots, seed.exceptions);
    expect(range).toEqual({ startMinute: 9 * 60, endMinute: 18 * 60 });
  });

  it("solo muestra días con clase (L–V aquí)", () => {
    expect(getVisibleDays(seed.slots, seed.exceptions, 1)).toEqual([1, 2, 3, 4, 5]);
    const withSunday = [...seed.slots, { dayOfWeek: 7 as const }];
    expect(getVisibleDays(withSunday, [], 1)).toEqual([1, 2, 3, 4, 5, 7]);
    expect(getVisibleDays(withSunday, [], 0)).toEqual([7, 1, 2, 3, 4, 5]);
  });

  it("reparte en dos carriles las clases solapadas y deja las demás a ancho completo", () => {
    const range = computeGridRange(seed.slots, seed.exceptions);
    const blocks = layoutDayBlocks(getInstancesOn(resolveWeek, seed.schedule, monday), range);
    const by = (g: string) => blocks.find((b) => b.instance.slotGroupId === g)!;
    expect(by("g-calc-mon").lanes).toBe(2);
    expect(by("g-ing-mon").lanes).toBe(2);
    expect(by("g-calc-mon").lane).not.toBe(by("g-ing-mon").lane);
    expect(by("g-alg-mon").lanes).toBe(1);
    expect(by("g-alg-mon").topPct).toBeCloseTo(0, 5);
    expect(by("g-alg-mon").heightPct).toBeCloseTo((90 / 540) * 100, 3);
  });
});

describe("semanas", () => {
  it("el 26 oct 2026 es la semana 7 del curso", () => {
    expect(dateToWeekNumber(seed.schedule, monday)).toBe(7);
  });
});