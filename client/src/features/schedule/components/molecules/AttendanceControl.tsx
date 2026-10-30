import { useState } from "react";
import Icon from "#shared/ui/atoms/icons";
import useAnnounce from "#core/a11y/useAnnounce";
import type { AttendanceStatus } from "../../domain/attendanceRecord.entity";
import type { ResolvedClassInstance } from "../../domain/resolvedInstance.entity";
import useSchedule from "../../presentation/hooks/useSchedule";

const OPTIONS: { status: AttendanceStatus; icon: string; label: string; spoken: string }[] = [
  { status: "present", icon: "IconCheck", label: "Asistí", spoken: "presente" },
  { status: "late", icon: "IconClock", label: "Llegué tarde", spoken: "con retraso" },
  { status: "absent", icon: "IconX", label: "Falté", spoken: "falta" },
];

/**
 * Marca la asistencia de UNA ocurrencia. Es un upsert idempotente (id
 * determinista por clase-fecha), así que reintentar nunca duplica. No hay
 * "borrar asistencia" en el repositorio: se puede cambiar, no deshacer.
 */
export default function AttendanceControl({
  instance,
  subjectName,
  disabled,
  disabledReason,
}: {
  instance: ResolvedClassInstance;
  subjectName: string;
  disabled: boolean;
  disabledReason?: string;
}) {
  const { markAttendance } = useSchedule();
  const announce = useAnnounce();
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const current = instance.attendance?.status;

  const mark = async (status: AttendanceStatus, spoken: string) => {
    if (busy || status === current) return;
    setBusy(true);
    setFailed(false);
    try {
      const result = await markAttendance(instance, status);
      if (result.success) {
        announce(`Asistencia a ${subjectName}: ${spoken}`);
      } else {
        setFailed(true);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div
        className="sch-att"
        role="group"
        aria-label={`Asistencia a ${subjectName}`}
        title={disabled ? disabledReason : undefined}
      >
        {OPTIONS.map((o) => (
          <button
            key={o.status}
            type="button"
            data-status={o.status}
            aria-pressed={current === o.status}
            aria-label={o.label}
            title={o.label}
            disabled={disabled || busy}
            onClick={() => void mark(o.status, o.spoken)}
          >
            <Icon name={o.icon} />
          </button>
        ))}
      </div>
      {failed && (
        <span className="sch-att-error" role="alert">
          No se guardó la asistencia. Inténtalo de nuevo.
        </span>
      )}
    </>
  );
}
