import { useMemo, type ReactNode } from "react";
import Icon from "#shared/ui/atoms/icons";
import type { Schedule } from "../../domain/schedule.entity";
import type { Subject } from "../../domain/subject.entity";
import type { ClassSlot } from "../../domain/classSlot.entity";
import type { ResolvedClassInstance } from "../../domain/resolvedInstance.entity";
import type { OccurrenceException } from "../../domain/occurrenceException.entity";
import type { ScheduleContextValue } from "../../presentation/context/scheduleContext";
import useSchedule from "../../presentation/hooks/useSchedule";
import "../templates/widget/scheduleWidget.css";

/** Contexto ya garantizado como "ready", con las asignaturas archivadas fuera. */
export type ReadySchedule = ScheduleContextValue & {
  schedule: Schedule;
  /** Solo asignaturas activas (las archivadas no aportan clases). */
  subjects: Subject[];
  subjectsById: Map<string, Subject>;
  /** Versiones de clase / excepciones de asignaturas activas — base de la escala de la parrilla. */
  visibleSlots: ClassSlot[];
  visibleExceptions: OccurrenceException[];
  /** Motivo de la excepción que originó esta ocurrencia ("Aula cambiada por obras"), si lo hay. */
  reasonOf: (instance: ResolvedClassInstance) => string | undefined;
};

export function ScheduleMessage({
  icon,
  title,
  text,
  role,
}: {
  icon: string;
  title: string;
  text?: string;
  role?: "status" | "alert";
}) {
  return (
    <div className="sch-state" role={role}>
      <Icon name={icon} />
      <p className="sch-state__title">{title}</p>
      {text && <p className="sch-state__text">{text}</p>}
    </div>
  );
}

/**
 * Raíz común de todos los widgets de Schedule: pinta el contenedor `.sch` y,
 * según el estado de la feature, un cargando / vacío / error — o ejecuta
 * `children` con los datos ya listos. Así ningún widget repite esa lógica ni
 * resuelve semanas con datos a medio llegar.
 */
export default function ScheduleGate({
  label,
  className,
  children,
}: {
  label: string;
  className: string;
  children: (ready: ReadySchedule) => ReactNode;
}) {
  const ctx = useSchedule();
  const { state } = ctx;

  const subjects = useMemo(
    () => state.subjects.filter((s) => !s.isArchived),
    [state.subjects],
  );
  const subjectsById = useMemo(
    () => new Map(subjects.map((s) => [s.id, s])),
    [subjects],
  );
  const visibleSlots = useMemo(
    () => state.slots.filter((s) => subjectsById.has(s.subjectId)),
    [state.slots, subjectsById],
  );
  const visibleExceptions = useMemo(() => {
    const groups = new Set(visibleSlots.map((s) => s.slotGroupId));
    return state.exceptions.filter((e) => groups.has(e.slotGroupId));
  }, [state.exceptions, visibleSlots]);

  const reasonOf = useMemo(() => {
    const byId = new Map(state.exceptions.map((e) => [e.id, e.reason]));
    return (instance: ResolvedClassInstance) =>
      instance.isException ? byId.get(instance.sourceVersionId) : undefined;
  }, [state.exceptions]);

  let content: ReactNode;
  if (state.status === "loading") {
    content = (
      <div className="sch-skel" role="status" aria-busy="true">
        <span className="sch-sr">Cargando horario…</span>
        <span />
        <span />
        <span />
      </div>
    );
  } else if (state.status === "error") {
    content = (
      <ScheduleMessage
        role="alert"
        icon="IconAlertTriangle"
        title="No se pudo cargar el horario"
        text="Comprueba tu conexión y vuelve a abrir el panel."
      />
    );
  } else if (state.status === "empty" || !state.schedule) {
    content = (
      <ScheduleMessage
        icon="IconCalendarOff"
        title="Este panel no tiene horario"
        text="Cuando exista un horario, tus clases aparecerán aquí."
      />
    );
  } else {
    content = children({
      ...ctx,
      schedule: state.schedule,
      subjects,
      subjectsById,
      visibleSlots,
      visibleExceptions,
      reasonOf,
    });
  }

  return (
    <section className={`sch ${className}`} aria-label={label}>
      {content}
    </section>
  );
}
