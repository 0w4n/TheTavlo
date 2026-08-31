import { err, isErr, notFoundErr, validationErr, } from "#core/appCore/domain/AppCore.type";
import { planClassSlotDeletion, planClassSlotEdit, } from "../domain/classSlotVersioning";
import { detectConflicts, resolveWeek as resolveWeekPure, } from "../domain/scheduleResolver";
import ScheduleRules from "../domain/schedule.rules";
import { weekNumberAndDayToDate } from "../domain/weekMath";
export class ScheduleService {
    constructor(repository) {
        Object.defineProperty(this, "repository", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: repository
        });
    }
    // ─── Suscripciones ────────────────────────────────────────────────────────
    subscribeToSchedule(onData, onError) {
        return this.repository.subscribeToSchedule(onData, onError);
    }
    subscribeToSubjects(scheduleId, onData, onError) {
        return this.repository.subscribeToSubjects(scheduleId, onData, onError);
    }
    subscribeToSlotVersions(scheduleId, onData, onError) {
        return this.repository.subscribeToSlotVersions(scheduleId, onData, onError);
    }
    subscribeToExceptions(scheduleId, onData, onError) {
        return this.repository.subscribeToExceptions(scheduleId, onData, onError);
    }
    subscribeToAttendance(scheduleId, onData, onError) {
        return this.repository.subscribeToAttendance(scheduleId, onData, onError);
    }
    // ─── Resolución (dominio puro, datos ya en memoria — diseño §12) ─────────
    /**
     * `resolveWeek.useCase.ts` del diseño §4: no toca el repositorio, opera
     * sobre los datos que ya trajeron las suscripciones. Incluye el segundo
     * paso de detección de conflictos (§16) para no obligar a cada consumidor
     * a acordarse de encadenarlo.
     */
    resolveWeek(input) {
        return detectConflicts(resolveWeekPure(input));
    }
    // ─── Schedule ────────────────────────────────────────────────────────────
    async getSchedule() {
        return this.repository.findSchedule();
    }
    async createSchedule(data) {
        const nameError = ScheduleRules.validateName(data.name);
        if (nameError)
            return err(validationErr(nameError, { name: nameError }));
        const dateError = ScheduleRules.validateDateRange(data.startDate.toDate(), data.endDate.toDate());
        if (dateError)
            return err(validationErr(dateError, { endDate: dateError }));
        return this.repository.createSchedule(data);
    }
    async updateSchedule(id, data) {
        if (data.name !== undefined) {
            const nameError = ScheduleRules.validateName(data.name);
            if (nameError)
                return err(validationErr(nameError, { name: nameError }));
        }
        if (data.startDate && data.endDate) {
            const dateError = ScheduleRules.validateDateRange(data.startDate.toDate(), data.endDate.toDate());
            if (dateError)
                return err(validationErr(dateError, { endDate: dateError }));
        }
        return this.repository.updateSchedule(id, data);
    }
    // ─── Subject ─────────────────────────────────────────────────────────────
    async createSubject(scheduleId, data) {
        const nameError = ScheduleRules.validateSubjectName(data.name);
        if (nameError)
            return err(validationErr(nameError, { name: nameError }));
        if (data.exam && data.exam.hasExam) {
            const weightError = ScheduleRules.validateExamWeight(data.exam.weightPercentage);
            if (weightError) {
                return err(validationErr(weightError, { weightPercentage: weightError }));
            }
        }
        return this.repository.createSubject(scheduleId, data);
    }
    async updateSubject(scheduleId, id, data) {
        if (data.name !== undefined) {
            const nameError = ScheduleRules.validateSubjectName(data.name);
            if (nameError)
                return err(validationErr(nameError, { name: nameError }));
        }
        if (data.exam && data.exam.hasExam) {
            const weightError = ScheduleRules.validateExamWeight(data.exam.weightPercentage);
            if (weightError) {
                return err(validationErr(weightError, { weightPercentage: weightError }));
            }
        }
        return this.repository.updateSubject(scheduleId, id, data);
    }
    async archiveSubject(scheduleId, id) {
        return this.repository.archiveSubject(scheduleId, id);
    }
    // ─── ClassSlot: creación inicial ──────────────────────────────────────────
    async createClassSlot(scheduleId, data) {
        const contentError = ScheduleRules.validateClassSlotContent(data);
        if (contentError) {
            return err(validationErr(contentError, { startMinute: contentError }));
        }
        return this.repository.createClassSlot(scheduleId, data);
    }
    // ─── ClassSlot: edición/eliminación con alcance (el corazón del diseño §14-15) ─
    /**
     * Orquesta el flujo completo de `EditScopeDialog` (diseño §7.3): busca la
     * versión activa para `week`, valida la precondición y el propio scope,
     * delega en `planClassSlotEdit` (dominio, puro) la decisión de QUÉ
     * escribir, y le pide al repositorio que lo ejecute de forma atómica.
     */
    async editClassSlot(params) {
        const { schedule, scheduleId, slotGroupId, week, scope, changes } = params;
        const scopeError = ScheduleRules.validateWeekRangeScope(scope);
        if (scopeError)
            return err(validationErr(scopeError, { scope: scopeError }));
        const activeSlotResult = await this.repository.findActiveSlotVersion(scheduleId, slotGroupId, week);
        if (isErr(activeSlotResult))
            return activeSlotResult;
        const activeSlot = activeSlotResult.value;
        if (!activeSlot) {
            return err(notFoundErr(`No hay ninguna versión de la clase "${slotGroupId}" activa en la semana ${week}`));
        }
        if (changes.startMinute !== undefined || changes.endMinute !== undefined) {
            const contentError = ScheduleRules.validateClassSlotContent({
                startMinute: changes.startMinute ?? activeSlot.startMinute,
                endMinute: changes.endMinute ?? activeSlot.endMinute,
            });
            if (contentError) {
                return err(validationErr(contentError, { startMinute: contentError }));
            }
        }
        const occurrenceDate = weekNumberAndDayToDate(schedule, week, activeSlot.dayOfWeek);
        const plan = planClassSlotEdit({
            activeSlot,
            scope,
            changes,
            occurrenceDate,
            currentWeek: week,
        });
        return this.applyPlan(scheduleId, plan);
    }
    async deleteClassSlot(params) {
        const { schedule, scheduleId, slotGroupId, week, scope } = params;
        const scopeError = ScheduleRules.validateWeekRangeScope(scope);
        if (scopeError)
            return err(validationErr(scopeError, { scope: scopeError }));
        const activeSlotResult = await this.repository.findActiveSlotVersion(scheduleId, slotGroupId, week);
        if (isErr(activeSlotResult))
            return activeSlotResult;
        const activeSlot = activeSlotResult.value;
        if (!activeSlot) {
            return err(notFoundErr(`No hay ninguna versión de la clase "${slotGroupId}" activa en la semana ${week}`));
        }
        const occurrenceDate = weekNumberAndDayToDate(schedule, week, activeSlot.dayOfWeek);
        const plan = planClassSlotDeletion({
            activeSlot,
            scope,
            occurrenceDate,
            currentWeek: week,
        });
        return this.applyPlan(scheduleId, plan);
    }
    async applyPlan(scheduleId, plan) {
        const result = await this.repository.applyClassSlotChangePlan(scheduleId, plan);
        if (isErr(result) && result.err.kind === "Firebase") {
            // El error de concurrencia (EC-12) llega como FirebaseErr desde la
            // transacción abortada — lo dejamos pasar tal cual, es la capa de
            // presentación (Flujo C, diseño §8) la que decide cómo ofrecerle al
            // usuario "ver cambios / reintentar", no el servicio.
            return result;
        }
        return result;
    }
    // ─── Asistencia (UC-17) ────────────────────────────────────────────────────
    async markAttendance(scheduleId, data) {
        const attendanceError = ScheduleRules.validateAttendance(data);
        if (attendanceError) {
            return err(validationErr(attendanceError, { reason: attendanceError }));
        }
        return this.repository.upsertAttendance(scheduleId, data);
    }
}
