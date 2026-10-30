import type { Schedule } from "../../domain/schedule.entity";
import type { Subject } from "../../domain/subject.entity";
import type { ClassSlot } from "../../domain/classSlot.entity";
import type { OccurrenceException } from "../../domain/occurrenceException.entity";
import type { AttendanceRecord } from "../../domain/attendanceRecord.entity";

/**
 * - `loading`: faltan datos (el horario o alguna de sus 4 colecciones).
 * - `empty`:   el panel todavía no tiene Schedule (regla: 0 o 1 por panel).
 * - `ready`:   horario y las 4 colecciones recibidas — ya se puede resolver.
 * - `error`:   alguna suscripción falló.
 *
 * "ready" espera a las 4 colecciones a propósito: si un widget resolviera la
 * semana con solo `schedule` + `subjects` mostraría un "hoy no tienes clases"
 * falso durante unos milisegundos, hasta que lleguen los `slots`.
 */
export type ScheduleStatus = "loading" | "empty" | "ready" | "error";

type LoadedFlags = {
  subjects: boolean;
  slots: boolean;
  exceptions: boolean;
  attendance: boolean;
};

export interface ScheduleState {
  status: ScheduleStatus;
  schedule: Schedule | null;
  subjects: Subject[];
  slots: ClassSlot[];
  exceptions: OccurrenceException[];
  attendance: AttendanceRecord[];
  loaded: LoadedFlags;
  error?: string;
}

const NOT_LOADED: LoadedFlags = {
  subjects: false,
  slots: false,
  exceptions: false,
  attendance: false,
};

export const initialScheduleState: ScheduleState = {
  status: "loading",
  schedule: null,
  subjects: [],
  slots: [],
  exceptions: [],
  attendance: [],
  loaded: NOT_LOADED,
};

export type ScheduleAction =
  | { type: "RESET" }
  | { type: "NO_SCHEDULE" }
  | { type: "SCHEDULE_CHANGED"; payload: Schedule } // otro id: se descartan las colecciones
  | { type: "SCHEDULE_UPDATED"; payload: Schedule } // mismo id: se conservan
  | { type: "SUBJECTS"; payload: Subject[] }
  | { type: "SLOTS"; payload: ClassSlot[] }
  | { type: "EXCEPTIONS"; payload: OccurrenceException[] }
  | { type: "ATTENDANCE"; payload: AttendanceRecord[] }
  | { type: "ERROR"; payload: string };

function derive(state: ScheduleState): ScheduleState {
  if (state.status === "error") return state;
  if (!state.schedule) return { ...state, status: "empty" };
  const { subjects, slots, exceptions, attendance } = state.loaded;
  const ready = subjects && slots && exceptions && attendance;
  return { ...state, status: ready ? "ready" : "loading" };
}

export function scheduleReducer(
  state: ScheduleState,
  action: ScheduleAction,
): ScheduleState {
  switch (action.type) {
    case "RESET":
      return initialScheduleState;

    case "NO_SCHEDULE":
      return { ...initialScheduleState, status: "empty" };

    case "SCHEDULE_CHANGED":
      return derive({
        ...initialScheduleState,
        schedule: action.payload,
      });

    case "SCHEDULE_UPDATED":
      return derive({ ...state, schedule: action.payload, error: undefined });

    case "SUBJECTS":
      return derive({
        ...state,
        subjects: action.payload,
        loaded: { ...state.loaded, subjects: true },
      });

    case "SLOTS":
      return derive({
        ...state,
        slots: action.payload,
        loaded: { ...state.loaded, slots: true },
      });

    case "EXCEPTIONS":
      return derive({
        ...state,
        exceptions: action.payload,
        loaded: { ...state.loaded, exceptions: true },
      });

    case "ATTENDANCE":
      return derive({
        ...state,
        attendance: action.payload,
        loaded: { ...state.loaded, attendance: true },
      });

    case "ERROR":
      return { ...state, status: "error", error: action.payload };

    default:
      return state;
  }
}