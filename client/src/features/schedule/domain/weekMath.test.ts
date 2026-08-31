import { describe, expect, it } from "vitest";
import { Timestamp } from "firebase/firestore";
import {
  dateToWeekNumber,
  getScheduleWeekCount,
  isHoliday,
  isoDayOfWeek,
  timestampToLocalDateKey,
  toLocalDateKey,
  weekNumberAndDayToDate,
  weekNumberToDateRange,
} from "./weekMath";
import type { Schedule } from "./schedule.entity";

function localDate(y: number, m: number, d: number): Date {
  return new Date(y, m - 1, d);
}

function ts(y: number, m: number, d: number): Timestamp {
  return Timestamp.fromDate(localDate(y, m, d));
}

// Cuatrimestre de ejemplo: empieza un miércoles (2025-09-03), semana lunes-domingo.
function makeSchedule(overrides: Partial<Schedule> = {}): Schedule {
  return {
    id: "sched-1",
    homePanelRef: { id: "panel-1" } as any,
    name: "1er cuatrimestre 25-26",
    startDate: ts(2025, 9, 3), // miércoles
    endDate: ts(2025, 12, 19), // viernes
    weekStartsOn: 1,
    holidays: [],
    createdAt: ts(2025, 1, 1),
    updatedAt: ts(2025, 1, 1),
    ...overrides,
  };
}

describe("isoDayOfWeek", () => {
  it("mapea domingo (getDay()=0) a 7", () => {
    expect(isoDayOfWeek(localDate(2025, 9, 7))).toBe(7); // domingo
  });
  it("mapea lunes a 1", () => {
    expect(isoDayOfWeek(localDate(2025, 9, 8))).toBe(1); // lunes
  });
  it("mapea sábado a 6", () => {
    expect(isoDayOfWeek(localDate(2025, 9, 6))).toBe(6); // sábado
  });
});

describe("dateToWeekNumber — semana parcial al inicio (EC-5)", () => {
  const schedule = makeSchedule();

  it("la propia fecha de inicio (miércoles) cae en la semana 1", () => {
    expect(dateToWeekNumber(schedule, localDate(2025, 9, 3))).toBe(1);
  });

  it("el lunes ANTERIOR al inicio también es semana 1 (misma semana ISO)", () => {
    expect(dateToWeekNumber(schedule, localDate(2025, 9, 1))).toBe(1);
  });

  it("el lunes siguiente ya es semana 2", () => {
    expect(dateToWeekNumber(schedule, localDate(2025, 9, 8))).toBe(2);
  });

  it("8 semanas después es semana 9", () => {
    expect(dateToWeekNumber(schedule, localDate(2025, 10, 27))).toBe(9);
  });
});

describe("weekNumberToDateRange / weekNumberAndDayToDate — inversas de dateToWeekNumber", () => {
  const schedule = makeSchedule();

  it("el rango de la semana 1 empieza el lunes que contiene el startDate", () => {
    const { start, end } = weekNumberToDateRange(schedule, 1);
    expect(toLocalDateKey(start)).toBe("2025-09-01"); // lunes
    expect(toLocalDateKey(end)).toBe("2025-09-07"); // domingo
  });

  it("semana 8, martes -> fecha exacta consistente con dateToWeekNumber", () => {
    const date = weekNumberAndDayToDate(schedule, 8, 2); // martes
    expect(dateToWeekNumber(schedule, date)).toBe(8);
    expect(isoDayOfWeek(date)).toBe(2);
  });

  it("round-trip para todos los días de varias semanas", () => {
    for (let week = 1; week <= 15; week++) {
      for (let day = 1; day <= 7; day++) {
        const dayOfWeek = day as 1 | 2 | 3 | 4 | 5 | 6 | 7;
        const date = weekNumberAndDayToDate(schedule, week, dayOfWeek);
        expect(dateToWeekNumber(schedule, date)).toBe(week);
        expect(isoDayOfWeek(date)).toBe(dayOfWeek);
      }
    }
  });
});

describe("weekStartsOn: 0 (semana empieza en domingo)", () => {
  const schedule = makeSchedule({ weekStartsOn: 0 });

  it("el domingo es el primer día de la semana", () => {
    const { start } = weekNumberToDateRange(schedule, 1);
    expect(isoDayOfWeek(start)).toBe(7); // domingo
  });

  it("round-trip también se mantiene con semana domingo-sábado", () => {
    for (let day = 1; day <= 7; day++) {
      const dayOfWeek = day as 1 | 2 | 3 | 4 | 5 | 6 | 7;
      const date = weekNumberAndDayToDate(schedule, 5, dayOfWeek);
      expect(dateToWeekNumber(schedule, date)).toBe(5);
    }
  });
});

describe("getScheduleWeekCount", () => {
  it("cuenta el total de semanas del periodo completo", () => {
    const schedule = makeSchedule();
    const count = getScheduleWeekCount(schedule);
    // 2025-09-03 (semana 1) a 2025-12-19 (viernes) — verificamos que la
    // última semana calculada efectivamente contiene endDate.
    expect(dateToWeekNumber(schedule, schedule.endDate.toDate())).toBe(count);
  });
});

describe("isHoliday", () => {
  const schedule = makeSchedule({
    holidays: [
      { label: "Puente", startDate: ts(2025, 10, 10), endDate: ts(2025, 10, 13) },
    ],
  });

  it("reconoce un día dentro del rango festivo", () => {
    expect(isHoliday(schedule, localDate(2025, 10, 11))).toBe(true);
  });

  it("reconoce los extremos inclusive", () => {
    expect(isHoliday(schedule, localDate(2025, 10, 10))).toBe(true);
    expect(isHoliday(schedule, localDate(2025, 10, 13))).toBe(true);
  });

  it("no marca como festivo un día fuera del rango", () => {
    expect(isHoliday(schedule, localDate(2025, 10, 14))).toBe(false);
  });
});

describe("timestampToLocalDateKey", () => {
  it("formatea YYYY-MM-DD con padding", () => {
    expect(timestampToLocalDateKey(ts(2025, 1, 5))).toBe("2025-01-05");
  });
});
