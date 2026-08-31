const MINUTES_PER_DAY = 24 * 60;
export default class ScheduleRules {
    // ─── Schedule ────────────────────────────────────────────────────────────
    static validateName(name) {
        if (!name || name.trim().length === 0) {
            return "El nombre del horario es requerido";
        }
        if (name.length > 80) {
            return "El nombre no puede exceder 80 caracteres";
        }
        return null;
    }
    static validateDateRange(startDate, endDate) {
        if (startDate.getTime() >= endDate.getTime()) {
            return "La fecha de inicio debe ser anterior a la fecha de fin";
        }
        return null;
    }
    // ─── Subject ─────────────────────────────────────────────────────────────
    static validateSubjectName(name) {
        if (!name || name.trim().length === 0) {
            return "El nombre de la asignatura es requerido";
        }
        if (name.length > 80) {
            return "El nombre no puede exceder 80 caracteres";
        }
        return null;
    }
    static validateExamWeight(weightPercentage) {
        if (weightPercentage < 0 || weightPercentage > 100) {
            return "El porcentaje del examen debe estar entre 0 y 100";
        }
        return null;
    }
    // ─── ClassSlot ───────────────────────────────────────────────────────────
    static validateClassSlotContent(content) {
        const { startMinute, endMinute } = content;
        if (startMinute < 0 || startMinute >= MINUTES_PER_DAY) {
            return "La hora de inicio no es válida";
        }
        if (endMinute <= startMinute || endMinute > MINUTES_PER_DAY) {
            return "La hora de fin debe ser posterior a la hora de inicio";
        }
        return null;
    }
    /** Precondición del algoritmo de versionado (diseño §15): el alcance elegido debe operar sobre la versión efectivamente activa esa semana. */
    static validateSlotCoversWeek(slot, week) {
        if (week < slot.validFromWeek || week > slot.validToWeek) {
            return "La semana indicada no está cubierta por esta versión de la clase";
        }
        return null;
    }
    static validateWeekRangeScope(scope) {
        if (scope.kind !== "weekRange")
            return null;
        if (scope.fromWeek > scope.toWeek) {
            return "La semana de inicio del rango debe ser anterior o igual a la semana de fin";
        }
        if (scope.fromWeek < 1) {
            return "El rango de semanas no puede empezar antes de la semana 1";
        }
        return null;
    }
    // ─── Attendance ──────────────────────────────────────────────────────────
    /** EC-16: un motivo solo tiene sentido si la asistencia es "absent" o "late" — nunca en "present". */
    static validateAttendance(data) {
        if (data.status === "present" && data.reason && data.reason.trim().length > 0) {
            return "No se puede indicar un motivo cuando la asistencia es 'presente'";
        }
        return null;
    }
}
