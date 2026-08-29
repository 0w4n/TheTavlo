import { describe, expect, it } from "vitest";
import { Timestamp } from "firebase/firestore";
import { detectConflicts, resolveWeek } from "./scheduleResolver";
import type { Schedule } from "./schedule.entity";
import type { Subject } from "./subject.entity";
import type { ClassSlot } from "./classSlot.entity";
import { FOREVER_WEEK } from "./classSlot.entity";
import type { OccurrenceException } from "./occurrenceException.entity";
import type { AttendanceRecord } from "./attendanceRecord.entity";
import { buildAttendanceId } from "./attendanceRecord.entity";
import { weekNumberAndDayToDate, toLocalDateKey } from "./weekMath";

function localDate(y: number, m: number, d: number): Date {
  return new Date(y, m - 1, d);
}
function ts(y: number, m: number, d: number): Timestamp {
  return Timestamp.fromDate(localDate(y, m, d));
}
function tsNow(msOffset = 0): Timestamp {
  return Timestamp.fromMillis(Date.now() + msOffset);
}

const schedule: Pick<Schedule, "startDate" | "weekStartsOn" | "holidays"> = {
  startDate: ts(2025, 9, 1), // lunes, semana 1 empieza justo ahí
  weekStartsOn: 1,
  holidays: [],
};

const subject: Subject = {
  id: "subj-mate",
  scheduleId: "sched-1",
  name: "Matemáticas",
  color: "#6b7df6",
  panelRef: null,
  exam: null,
  isArchived: false,
  createdAt: tsNow(),
  updatedAt: tsNow(),
};

describe("resolveWeek — ejemplo del diseño §14 (Matemáticas martes 09-11 -> 10-12 en semanas 8-10)", () => {
  const v1: ClassSlot = {
    id: "v1",
    slotGroupId: "grupo-mate-martes",
    scheduleId: "sched-1",
    subjectId: subject.id,
    dayOfWeek: 2,
    startMinute: 9 * 60,
    endMinute: 11 * 60,
    type: "teoria",
    validFromWeek: 1,
    validToWeek: 7, // ya cerrada
    status: "superseded",
    supersedes: null,
    createdAt: tsNow(0),
  };
  const v2: ClassSlot = {
    ...v1,
    id: "v2",
    startMinute: 10 * 60,
    endMinute: 12 * 60,
    validFromWeek: 8,
    validToWeek: 10,
    status: "active",
    supersedes: "v1",
    createdAt: tsNow(1),
  };
  const v3: ClassSlot = {
    ...v1,
    id: "v3",
    validFromWeek: 11,
    validToWeek: FOREVER_WEEK,
    status: "active",
    supersedes: "v2",
    createdAt: tsNow(2),
  };

  const slots = [v1, v2, v3];

  it("semana 5 (pasado, dentro de v1) sigue mostrando 09-11 — historial intacto", () => {
    const [instance] = resolveWeek({
      schedule,
      subjects: [subject],
      slots,
      exceptions: [],
      attendance: [],
      week: 5,
    });
    expect(instance.startMinute).toBe(9 * 60);
    expect(instance.endMinute).toBe(11 * 60);
    expect(instance.sourceVersionId).toBe("v1");
  });

  it("semana 9 (dentro del rango cambiado) muestra 10-12", () => {
    const [instance] = resolveWeek({
      schedule,
      subjects: [subject],
      slots,
      exceptions: [],
      attendance: [],
      week: 9,
    });
    expect(instance.startMinute).toBe(10 * 60);
    expect(instance.endMinute).toBe(12 * 60);
    expect(instance.sourceVersionId).toBe("v2");
  });

  it("semana 12 (después del rango) vuelve a 09-11 sin haber tocado v1", () => {
    const [instance] = resolveWeek({
      schedule,
      subjects: [subject],
      slots,
      exceptions: [],
      attendance: [],
      week: 12,
    });
    expect(instance.startMinute).toBe(9 * 60);
    expect(instance.endMinute).toBe(11 * 60);
    expect(instance.sourceVersionId).toBe("v3");
  });
});

describe("resolveWeek — prioridad de excepciones (EC-9)", () => {
  const forever: ClassSlot = {
    id: "v1",
    slotGroupId: "grupo-fisica",
    scheduleId: "sched-1",
    subjectId: subject.id,
    dayOfWeek: 3,
    startMinute: 9 * 60,
    endMinute: 11 * 60,
    type: "teoria",
    validFromWeek: 1,
    validToWeek: FOREVER_WEEK,
    status: "active",
    supersedes: null,
    createdAt: tsNow(0),
  };

  it("una excepción puntual gana sobre la versión recurrente activa esa fecha exacta", () => {
    const exceptionDate = weekNumberAndDayToDate(schedule, 6, 3);
    const exception: OccurrenceException = {
      id: "exc-1",
      slotGroupId: forever.slotGroupId,
      scheduleId: "sched-1",
      date: Timestamp.fromDate(exceptionDate),
      kind: "modified",
      overrides: { room: "Aula 5B" },
      status: "active",
      supersedes: null,
      createdAt: tsNow(5),
    };

    const [instance] = resolveWeek({
      schedule,
      subjects: [subject],
      slots: [forever],
      exceptions: [exception],
      attendance: [],
      week: 6,
    });

    expect(instance.room).toBe("Aula 5B");
    expect(instance.isException).toBe(true);
  });

  it("la excepción de un día concreto sigue ganando aunque después se edite 'para siempre' el mismo slot", () => {
    // El usuario cambia "solo el martes 6" el aula, y DESPUÉS cambia el
    // profesor "para siempre" — ambos cambios deben convivir: el aula
    // especial se mantiene esa fecha exacta, el profesor nuevo aplica en
    // general (incluida esa misma semana, salvo el campo que pisa la excepción).
    const exceptionDate = weekNumberAndDayToDate(schedule, 6, 3);
    const roomException: OccurrenceException = {
      id: "exc-room",
      slotGroupId: forever.slotGroupId,
      scheduleId: "sched-1",
      date: Timestamp.fromDate(exceptionDate),
      kind: "modified",
      overrides: { room: "Aula 5B" },
      status: "active",
      supersedes: null,
      createdAt: tsNow(5),
    };

    // El cambio "para siempre" posterior en la práctica no reemplaza v1
    // (podría, según el algoritmo de versionado, generar una v2 con
    // validFromWeek = semanaActual) — simulamos aquí solo el efecto en el
    // resolver: llega una v2 con profesor nuevo desde la semana 6.
    const v2WithNewProfessor: ClassSlot = {
      ...forever,
      id: "v2",
      professor: "Dr. Nuevo",
      validFromWeek: 6,
      validToWeek: FOREVER_WEEK,
      supersedes: "v1",
      createdAt: tsNow(10),
    };
    const v1Closed: ClassSlot = {
      ...forever,
      validToWeek: 5,
      status: "superseded",
    };

    const [instance] = resolveWeek({
      schedule,
      subjects: [subject],
      slots: [v1Closed, v2WithNewProfessor],
      exceptions: [roomException],
      attendance: [],
      week: 6,
    });

    expect(instance.room).toBe("Aula 5B"); // la excepción puntual gana
    expect(instance.professor).toBe("Dr. Nuevo"); // el resto del contenido viene de la versión recurrente vigente
  });

  it("una excepción 'cancelled' produce una instancia con isCancelled=true, sin asistencia asociada", () => {
    const exceptionDate = weekNumberAndDayToDate(schedule, 4, 3);
    const attendanceRecord: AttendanceRecord = {
      id: buildAttendanceId(forever.slotGroupId, toLocalDateKey(exceptionDate)),
      slotGroupId: forever.slotGroupId,
      scheduleId: "sched-1",
      subjectId: subject.id,
      date: Timestamp.fromDate(exceptionDate),
      status: "present",
      createdAt: tsNow(),
      updatedAt: tsNow(),
    };
    const cancellation: OccurrenceException = {
      id: "exc-cancel",
      slotGroupId: forever.slotGroupId,
      scheduleId: "sched-1",
      date: Timestamp.fromDate(exceptionDate),
      kind: "cancelled",
      status: "active",
      supersedes: null,
      createdAt: tsNow(5),
    };

    const [instance] = resolveWeek({
      schedule,
      subjects: [subject],
      slots: [forever],
      exceptions: [cancellation],
      attendance: [attendanceRecord],
      week: 4,
    });

    expect(instance.isCancelled).toBe(true);
    expect(instance.attendance).toBeNull();
  });
});

describe("resolveWeek — festivo gana siempre (EC-2)", () => {
  it("no produce ninguna instancia el día festivo, aunque el slot esté activo esa semana", () => {
    const holidayDate = weekNumberAndDayToDate(schedule, 3, 4); // jueves semana 3
    const scheduleWithHoliday = {
      ...schedule,
      holidays: [{ label: "Puente", startDate: Timestamp.fromDate(holidayDate), endDate: Timestamp.fromDate(holidayDate) }],
    };
    const slot: ClassSlot = {
      id: "v1",
      slotGroupId: "grupo-x",
      scheduleId: "sched-1",
      subjectId: subject.id,
      dayOfWeek: 4,
      startMinute: 9 * 60,
      endMinute: 11 * 60,
      type: "teoria",
      validFromWeek: 1,
      validToWeek: FOREVER_WEEK,
      status: "active",
      supersedes: null,
      createdAt: tsNow(),
    };

    const instances = resolveWeek({
      schedule: scheduleWithHoliday,
      subjects: [subject],
      slots: [slot],
      exceptions: [],
      attendance: [],
      week: 3,
    });

    expect(instances).toHaveLength(0);
  });
});

describe("resolveWeek — asignatura inconsistente no rompe el render (EC-7)", () => {
  it("ignora un slot cuya asignatura ya no existe, en vez de lanzar", () => {
    const orphanSlot: ClassSlot = {
      id: "v1",
      slotGroupId: "grupo-huerfano",
      scheduleId: "sched-1",
      subjectId: "subject-borrado",
      dayOfWeek: 1,
      startMinute: 8 * 60,
      endMinute: 9 * 60,
      type: "otro",
      validFromWeek: 1,
      validToWeek: FOREVER_WEEK,
      status: "active",
      supersedes: null,
      createdAt: tsNow(),
    };

    expect(() =>
      resolveWeek({
        schedule,
        subjects: [], // la asignatura no está
        slots: [orphanSlot],
        exceptions: [],
        attendance: [],
        week: 1,
      }),
    ).not.toThrow();

    const instances = resolveWeek({
      schedule,
      subjects: [],
      slots: [orphanSlot],
      exceptions: [],
      attendance: [],
      week: 1,
    });
    expect(instances).toHaveLength(0);
  });
});

describe("detectConflicts (EC-8)", () => {
  const base: ClassSlot = {
    id: "v1",
    slotGroupId: "a",
    scheduleId: "sched-1",
    subjectId: subject.id,
    dayOfWeek: 2,
    startMinute: 9 * 60,
    endMinute: 11 * 60,
    type: "teoria",
    validFromWeek: 1,
    validToWeek: FOREVER_WEEK,
    status: "active",
    supersedes: null,
    createdAt: tsNow(0),
  };
  const overlapping: ClassSlot = {
    ...base,
    id: "v2",
    slotGroupId: "b",
    startMinute: 10 * 60,
    endMinute: 12 * 60,
    createdAt: tsNow(1),
  };
  const separate: ClassSlot = {
    ...base,
    id: "v3",
    slotGroupId: "c",
    startMinute: 12 * 60,
    endMinute: 13 * 60,
    createdAt: tsNow(2),
  };

  it("marca hasConflict=true en el par que se solapa, y false en el que no", () => {
    const instances = resolveWeek({
      schedule,
      subjects: [subject],
      slots: [base, overlapping, separate],
      exceptions: [],
      attendance: [],
      week: 1,
    });

    const withConflicts = detectConflicts(instances);
    const bySlot = new Map(withConflicts.map((i) => [i.slotGroupId, i]));

    expect(bySlot.get("a")!.hasConflict).toBe(true);
    expect(bySlot.get("b")!.hasConflict).toBe(true);
    expect(bySlot.get("c")!.hasConflict).toBe(false);
  });

  it("una clase cancelada nunca se marca en conflicto", () => {
    const cancellationDate = weekNumberAndDayToDate(schedule, 1, 2);
    const exception: OccurrenceException = {
      id: "exc-1",
      slotGroupId: "a",
      scheduleId: "sched-1",
      date: Timestamp.fromDate(cancellationDate),
      kind: "cancelled",
      status: "active",
      supersedes: null,
      createdAt: tsNow(5),
    };

    const instances = resolveWeek({
      schedule,
      subjects: [subject],
      slots: [base, overlapping],
      exceptions: [exception],
      attendance: [],
      week: 1,
    });

    const withConflicts = detectConflicts(instances);
    const bySlot = new Map(withConflicts.map((i) => [i.slotGroupId, i]));

    expect(bySlot.get("a")!.hasConflict).toBe(false); // cancelada, no cuenta
    expect(bySlot.get("b")!.hasConflict).toBe(false); // ya nadie con quien solaparse
  });
});
