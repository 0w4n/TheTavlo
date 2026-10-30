// Datos de ejemplo de un curso universitario, compartidos por los tests y por
// el sandbox visual (client/dev). Sin `vitest` ni nada de test: se importa
// también desde el navegador.
//
// Pensado para cubrir los casos que importan a la UI, no solo el camino feliz:
//   - un SOLAPE de horarios (lunes: Cálculo 11:00–12:30 vs. tutoría 12:00–13:00)
//   - una clase CANCELADA (martes 27 oct) y un AULA CAMBIADA (miércoles 28 oct)
//   - festivos y vacaciones dentro del periodo
//   - una asignatura ARCHIVADA que NO debe aparecer en ningún widget
//   - asistencia histórica con faltas, retrasos y clases sin marcar
//   - una asignatura (Cálculo) por debajo del 80 % de asistencia

import { Timestamp, type DocumentReference } from "firebase/firestore";
import type { Schedule } from "../../domain/schedule.entity";
import type { Subject } from "../../domain/subject.entity";
import {
  FOREVER_WEEK,
  type ClassSlot,
  type ClassType,
} from "../../domain/classSlot.entity";
import type { OccurrenceException } from "../../domain/occurrenceException.entity";
import {
  buildAttendanceId,
  type AttendanceRecord,
} from "../../domain/attendanceRecord.entity";
import { toLocalDateKey, weekNumberAndDayToDate } from "../../domain/weekMath";

export interface ScheduleSeed {
  schedule: Schedule;
  subjects: Subject[];
  slots: ClassSlot[];
  exceptions: OccurrenceException[];
  attendance: AttendanceRecord[];
}

/** Hora de referencia de la seed: lunes 26 oct 2026 (semana 7 del curso). */
export const SEED_MONDAY = new Date(2026, 9, 26);

const ts = (y: number, m: number, d: number) =>
  Timestamp.fromDate(new Date(y, m - 1, d));
const at = (h: number, m = 0) => h * 60 + m;

const SUBJECT_COLORS = {
  alg: "#5b8def",
  prog: "#f08c3a",
  fis: "#a87be6",
  calc: "#e8628a",
  ing: "#e5c13d",
  estr: "#3fbfd1",
  old: "#8a8a8a",
};

export function buildScheduleSeed(): ScheduleSeed {
  const created = Timestamp.fromMillis(Date.UTC(2026, 8, 1));

  const schedule: Schedule = {
    id: "sched-2026",
    homePanelRef: {} as DocumentReference,
    name: "1.º Ingeniería Informática · 1.er cuatrimestre",
    startDate: ts(2026, 9, 14),
    endDate: ts(2027, 1, 29),
    weekStartsOn: 1,
    holidays: [
      { label: "Lunes posterior a Todos los Santos", startDate: ts(2026, 11, 2), endDate: ts(2026, 11, 2) },
      { label: "Puente de la Constitución", startDate: ts(2026, 12, 7), endDate: ts(2026, 12, 8) },
      { label: "Vacaciones de Navidad", startDate: ts(2026, 12, 23), endDate: ts(2027, 1, 6) },
    ],
    createdAt: created,
    updatedAt: created,
  };

  const subject = (
    id: string,
    name: string,
    color: string,
    isArchived = false,
  ): Subject => ({
    id,
    scheduleId: schedule.id,
    name,
    color,
    panelRef: null,
    exam: null,
    isArchived,
    createdAt: created,
    updatedAt: created,
  });

  const subjects: Subject[] = [
    subject("subj-alg", "Álgebra Lineal", SUBJECT_COLORS.alg),
    subject("subj-prog", "Programación II", SUBJECT_COLORS.prog),
    subject("subj-fis", "Física General", SUBJECT_COLORS.fis),
    subject("subj-calc", "Cálculo", SUBJECT_COLORS.calc),
    subject("subj-ing", "Inglés Técnico", SUBJECT_COLORS.ing),
    subject("subj-estr", "Estructura de Computadores", SUBJECT_COLORS.estr),
    subject("subj-old", "Dibujo Técnico", SUBJECT_COLORS.old, true),
  ];

  let versionCounter = 0;
  const slot = (
    group: string,
    subjectId: string,
    dayOfWeek: ClassSlot["dayOfWeek"],
    start: number,
    end: number,
    type: ClassType,
    extra: Pick<ClassSlot, "room" | "building" | "professor"> = {},
  ): ClassSlot => {
    versionCounter += 1;
    return {
      id: `v${versionCounter}-${group}`,
      slotGroupId: group,
      scheduleId: schedule.id,
      subjectId,
      dayOfWeek,
      startMinute: start,
      endMinute: end,
      type,
      ...extra,
      validFromWeek: 1,
      validToWeek: FOREVER_WEEK,
      status: "active",
      supersedes: null,
      createdAt: created,
      editReason: "initial",
    };
  };

  const slots: ClassSlot[] = [
    // Lunes
    slot("g-alg-mon", "subj-alg", 1, at(9), at(10, 30), "teoria", { room: "A2.04", building: "Edificio Ada Lovelace", professor: "Marta Ibáñez" }),
    slot("g-calc-mon", "subj-calc", 1, at(11), at(12, 30), "teoria", { room: "A1.02", building: "Edificio Ada Lovelace", professor: "Javier Soto" }),
    slot("g-ing-mon", "subj-ing", 1, at(12), at(13), "tutoria", { room: "Despacho 3.11", building: "Edificio Idiomas", professor: "Claire Dunn" }),
    slot("g-prog-lab", "subj-prog", 1, at(15), at(17), "laboratorio", { room: "Lab 3", building: "Edificio Turing", professor: "Lucía Ferrer" }),
    // Martes
    slot("g-fis-tue", "subj-fis", 2, at(9), at(10, 30), "teoria", { room: "A3.01", building: "Edificio Curie", professor: "Andrés Vidal" }),
    slot("g-ing-tue", "subj-ing", 2, at(12), at(13), "seminario", { room: "B1.07", building: "Edificio Idiomas", professor: "Claire Dunn" }),
    slot("g-estr-tue", "subj-estr", 2, at(16), at(18), "teoria", { room: "A2.04", building: "Edificio Ada Lovelace", professor: "Pablo Navarro" }),
    // Miércoles
    slot("g-alg-wed", "subj-alg", 3, at(9), at(10, 30), "teoria", { room: "A2.04", building: "Edificio Ada Lovelace", professor: "Marta Ibáñez" }),
    slot("g-prog-wed", "subj-prog", 3, at(11), at(12, 30), "teoria", { room: "A1.02", building: "Edificio Ada Lovelace", professor: "Lucía Ferrer" }),
    slot("g-calc-wed", "subj-calc", 3, at(13), at(14), "seminario", { room: "S2", building: "Edificio Gauss", professor: "Javier Soto" }),
    // Jueves
    slot("g-fis-lab", "subj-fis", 4, at(10), at(12), "laboratorio", { room: "Lab Física", building: "Edificio Curie", professor: "Andrés Vidal" }),
    slot("g-estr-lab", "subj-estr", 4, at(16), at(18), "laboratorio", { room: "Lab 1", building: "Edificio Turing", professor: "Pablo Navarro" }),
    slot("g-old-thu", "subj-old", 4, at(12), at(13), "teoria", { room: "D1" }), // archivada: no debe verse
    // Viernes
    slot("g-calc-fri", "subj-calc", 5, at(9), at(10, 30), "teoria", { room: "A1.02", building: "Edificio Ada Lovelace", professor: "Javier Soto" }),
    slot("g-prog-fri", "subj-prog", 5, at(11), at(12, 30), "teoria", { room: "A1.02", building: "Edificio Ada Lovelace", professor: "Lucía Ferrer" }),
  ];

  const exception = (
    id: string,
    slotGroupId: string,
    date: Date,
    kind: OccurrenceException["kind"],
    extra: Partial<OccurrenceException> = {},
  ): OccurrenceException => ({
    id,
    slotGroupId,
    scheduleId: schedule.id,
    date: Timestamp.fromDate(date),
    kind,
    status: "active",
    supersedes: null,
    createdAt: created,
    ...extra,
  });

  const exceptions: OccurrenceException[] = [
    exception("ex-fis-cancel", "g-fis-tue", new Date(2026, 9, 27), "cancelled", {
      reason: "El profesor asiste a un congreso",
    }),
    exception("ex-alg-room", "g-alg-wed", new Date(2026, 9, 28), "modified", {
      overrides: { room: "A0.12", building: "Edificio Gauss" },
      reason: "Aula cambiada por obras",
    }),
  ];

  // ── Asistencia de las semanas 1–6, determinista ───────────────────────
  const attendance: AttendanceRecord[] = [];
  const activeSlots = slots.filter((s) => s.subjectId !== "subj-old");
  for (let week = 1; week <= 6; week++) {
    activeSlots.forEach((s, index) => {
      const date = weekNumberAndDayToDate(schedule, week, s.dayOfWeek);
      const roll = (week * 7 + index * 3) % 11;
      // Cálculo falla más a propósito → queda por debajo del umbral.
      const missesMore = s.subjectId === "subj-calc" && roll % 3 === 0;
      let status: AttendanceRecord["status"] | null = "present";
      if (missesMore || roll === 0) status = "absent";
      else if (roll === 1) status = "late";
      else if (roll === 2) status = null; // sin marcar
      if (!status) return;

      attendance.push({
        id: buildAttendanceId(s.slotGroupId, toLocalDateKey(date)),
        slotGroupId: s.slotGroupId,
        scheduleId: schedule.id,
        subjectId: s.subjectId,
        date: Timestamp.fromDate(date),
        status,
        createdAt: created,
        updatedAt: created,
      });
    });
  }

  // Esta mañana ya se marcó la clase de Álgebra de las 9:00.
  const algToday = weekNumberAndDayToDate(schedule, 7, 1);
  attendance.push({
    id: buildAttendanceId("g-alg-mon", toLocalDateKey(algToday)),
    slotGroupId: "g-alg-mon",
    scheduleId: schedule.id,
    subjectId: "subj-alg",
    date: Timestamp.fromDate(algToday),
    status: "present",
    createdAt: created,
    updatedAt: created,
  });

  return { schedule, subjects, slots, exceptions, attendance };
}