import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  type PropsWithChildren,
} from "react";
import type { Unsubscribe } from "firebase/firestore";
import {
  err,
  notFoundErr,
  type AppErr,
  type ResultApp,
} from "#core/appCore/domain/AppCore.type";
import type { ScheduleService } from "../../app/schedule.service";
import type {
  AttendanceRecord,
  AttendanceStatus,
} from "../../domain/attendanceRecord.entity";
import type { ResolvedClassInstance } from "../../domain/resolvedInstance.entity";
import { clipToSchedulePeriod } from "../../components/selectors/scheduleSelectors";
import {
  initialScheduleState,
  scheduleReducer,
  type ScheduleState,
} from "./scheduleReducer";

/** Lo mínimo que hace falta de una clase resuelta para marcar su asistencia. */
export type AttendanceTarget = Pick<
  ResolvedClassInstance,
  "slotGroupId" | "subjectId" | "date" | "attendance"
>;

export type ScheduleContextValue = {
  state: ScheduleState;
  /**
   * Reloj de la feature. En producción es `new Date()`; existe como punto de
   * inyección para tests y para el sandbox (congelar/avanzar la hora sin
   * tocar el reloj del sistema).
   */
  now: () => Date;
  /**
   * Horario de la semana `week` ya resuelto (versiones + excepciones +
   * festivos + asistencia + conflictos), recortado al periodo del Schedule.
   * Cambia de identidad cuando cambia cualquier dato → úsalo como dependencia
   * de `useMemo`.
   */
  resolveWeek: (week: number) => ResolvedClassInstance[];
  markAttendance: (
    target: AttendanceTarget,
    status: AttendanceStatus,
  ) => Promise<ResultApp<AttendanceRecord, AppErr>>;
};

export const ScheduleContext = createContext<ScheduleContextValue | undefined>(
  undefined,
);

const systemClock = () => new Date();

type ScheduleProviderProps = PropsWithChildren<{
  scheduleService: ScheduleService;
  now?: () => Date;
}>;

export function ScheduleProvider({
  children,
  scheduleService,
  now = systemClock,
}: ScheduleProviderProps) {
  const [state, dispatch] = useReducer(scheduleReducer, initialScheduleState);

  // `scheduleService` se recrea cuando cambia el usuario o el panel activo
  // (ver ProviderApp en App.tsx), lo que reinicia las suscripciones solo.
  //
  // Dos fases (contrato de `ScheduleRepository`): primero se escucha el
  // Schedule del panel; en cuanto se conoce su id se arrancan las otras
  // cuatro. Si el Schedule cambia de id o desaparece, se cancelan.
  useEffect(() => {
    dispatch({ type: "RESET" });

    let inner: Unsubscribe[] = [];
    let currentId: string | null = null;

    const stopInner = () => {
      inner.forEach((unsubscribe) => unsubscribe());
      inner = [];
    };
    const onError = (error: AppErr) =>
      dispatch({ type: "ERROR", payload: error.message });

    const stopSchedule = scheduleService.subscribeToSchedule((schedule) => {
      if (!schedule) {
        stopInner();
        currentId = null;
        dispatch({ type: "NO_SCHEDULE" });
        return;
      }
      if (schedule.id === currentId) {
        dispatch({ type: "SCHEDULE_UPDATED", payload: schedule });
        return;
      }

      stopInner();
      currentId = schedule.id;
      dispatch({ type: "SCHEDULE_CHANGED", payload: schedule });
      inner = [
        scheduleService.subscribeToSubjects(
          schedule.id,
          (payload) => dispatch({ type: "SUBJECTS", payload }),
          onError,
        ),
        scheduleService.subscribeToSlotVersions(
          schedule.id,
          (payload) => dispatch({ type: "SLOTS", payload }),
          onError,
        ),
        scheduleService.subscribeToExceptions(
          schedule.id,
          (payload) => dispatch({ type: "EXCEPTIONS", payload }),
          onError,
        ),
        scheduleService.subscribeToAttendance(
          schedule.id,
          (payload) => dispatch({ type: "ATTENDANCE", payload }),
          onError,
        ),
      ];
    }, onError);

    return () => {
      stopSchedule();
      stopInner();
    };
  }, [scheduleService]);

  // `subscribeToSubjects` devuelve TAMBIÉN las archivadas. Una asignatura
  // archivada no debe aportar clases al horario visible (el resolver ya
  // ignora las que no encuentra, EC-7), así que se filtran aquí.
  const activeSubjects = useMemo(
    () => state.subjects.filter((subject) => !subject.isArchived),
    [state.subjects],
  );

  const resolveWeek = useCallback(
    (week: number): ResolvedClassInstance[] => {
      const { schedule } = state;
      if (!schedule) return [];

      const instances = scheduleService.resolveWeek({
        schedule,
        subjects: activeSubjects,
        slots: state.slots,
        exceptions: state.exceptions,
        attendance: state.attendance,
        week,
      });

      return clipToSchedulePeriod(schedule, instances);
    },
    [scheduleService, state, activeSubjects],
  );

  const markAttendance = useCallback(
    async (target: AttendanceTarget, status: AttendanceStatus) => {
      if (!state.schedule) {
        return err(notFoundErr("No hay ningún horario cargado en este panel"));
      }
      return scheduleService.markAttendance(state.schedule.id, {
        scheduleId: state.schedule.id,
        slotGroupId: target.slotGroupId,
        subjectId: target.subjectId,
        date: target.date,
        status,
        // Un motivo solo es válido para "absent"/"late" (EC-16): al pasar a
        // "present" se descarta; entre absent <-> late se conserva.
        reason: status === "present" ? undefined : target.attendance?.reason,
      });
    },
    [scheduleService, state.schedule],
  );

  const value = useMemo<ScheduleContextValue>(
    () => ({ state, now, resolveWeek, markAttendance }),
    [state, now, resolveWeek, markAttendance],
  );

  return (
    <ScheduleContext.Provider value={value}>
      {children}
    </ScheduleContext.Provider>
  );
}
