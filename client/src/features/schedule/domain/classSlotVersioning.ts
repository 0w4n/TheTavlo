import type { ClassSlot, ClassSlotContent, CreateClassSlotDTO } from "./classSlot.entity";
import { FOREVER_WEEK, toClassSlotContent } from "./classSlot.entity";
import type { CreateOccurrenceExceptionDTO } from "./occurrenceException.entity";
import type { EditScope } from "./editScope.type";
import { isSingleOccurrenceScope } from "./editScope.type";
import { Timestamp } from "firebase/firestore";

/**
 * El "plan" que produce este módulo es puro dato — describe QUÉ hay que
 * escribir, nunca ejecuta la escritura. Quien invoque esto (el servicio de
 * aplicación) es quien decide cómo aplicarlo (una transacción de Firestore,
 * un fake en memoria en tests, etc. — ver diseño §16, control de
 * concurrencia optimista).
 *
 * Todas las versiones nuevas de un mismo plan comparten `supersedes` (el id
 * de la versión que se cierra): son splits de UN mismo evento de edición,
 * no una cadena estrictamente lineal — la trazabilidad de "quién reemplazó
 * a quién" vive en `closePrevious`, no en cada DTO individual.
 */
export type ClassSlotChangePlan =
  | { kind: "exception"; exception: CreateOccurrenceExceptionDTO }
  | {
      kind: "versioning";
      closePrevious: { versionId: string; validToWeek: number };
      supersedes: string;
      newVersions: CreateClassSlotDTO[];
    };

export interface PlanClassSlotEditParams {
  activeSlot: ClassSlot;
  scope: EditScope;
  changes: Partial<ClassSlotContent>;
  /** Fecha exacta de la ocurrencia editada — solo se usa para scope "today"/"thisWeek". */
  occurrenceDate: Date;
  /**
   * Semana actual del `Schedule` — solo se usa para scope "fromNow"/"forever"/"weekRange".
   * PRECONDICIÓN: `activeSlot.validFromWeek <= currentWeek <= activeSlot.validToWeek`
   * (quien llama debe haber resuelto ya cuál es "la versión activa para esta semana"
   * antes de invocar esto — el resolver de §14 es la fuente de esa resolución).
   */
  currentWeek: number;
}

/**
 * Decide qué escribir al editar una clase, según el alcance elegido por el
 * usuario en `EditScopeDialog` (diseño §7.3/§15).
 */
export function planClassSlotEdit(params: PlanClassSlotEditParams): ClassSlotChangePlan {
  const { activeSlot, scope, changes, occurrenceDate, currentWeek } = params;

  if (isSingleOccurrenceScope(scope)) {
    return {
      kind: "exception",
      exception: buildExceptionDTO(activeSlot, occurrenceDate, changes),
    };
  }

  if (scope.kind === "fromNow" || scope.kind === "forever") {
    const newContent: ClassSlotContent = { ...toClassSlotContent(activeSlot), ...changes };
    return {
      kind: "versioning",
      closePrevious: { versionId: activeSlot.id, validToWeek: currentWeek - 1 },
      supersedes: activeSlot.id,
      newVersions: [
        buildClassSlotDTO(activeSlot, newContent, {
          validFromWeek: currentWeek,
          validToWeek: FOREVER_WEEK,
          editReason: scope.kind,
        }),
      ],
    };
  }

  // scope.kind === "weekRange"
  const { fromWeek, toWeek } = scope;
  const newContent: ClassSlotContent = { ...toClassSlotContent(activeSlot), ...changes };
  const originalContent = toClassSlotContent(activeSlot);

  const newVersions: CreateClassSlotDTO[] = [
    buildClassSlotDTO(activeSlot, newContent, {
      validFromWeek: fromWeek,
      validToWeek: toWeek,
      editReason: "weekRange",
    }),
  ];

  // Solo hace falta "reabrir" el patrón original si queda algo de vigencia
  // original DESPUÉS del rango editado (EC-10) — si el rango consume el
  // resto de la vigencia de `activeSlot`, no hay nada que continuar.
  if (toWeek < activeSlot.validToWeek) {
    newVersions.push(
      buildClassSlotDTO(activeSlot, originalContent, {
        validFromWeek: toWeek + 1,
        validToWeek: activeSlot.validToWeek,
        editReason: "weekRange",
      }),
    );
  }

  return {
    kind: "versioning",
    closePrevious: { versionId: activeSlot.id, validToWeek: fromWeek - 1 },
    supersedes: activeSlot.id,
    newVersions,
  };
}

export interface PlanClassSlotDeletionParams {
  activeSlot: ClassSlot;
  scope: EditScope;
  occurrenceDate: Date;
  currentWeek: number;
}

/**
 * Decide qué escribir al ELIMINAR una clase, según el alcance elegido.
 * Comparte estructura con `planClassSlotEdit` pero nunca reescribe
 * contenido — solo cierra vigencia y, si aplica, reabre el patrón original
 * después del rango borrado.
 */
export function planClassSlotDeletion(
  params: PlanClassSlotDeletionParams,
): ClassSlotChangePlan {
  const { activeSlot, scope, occurrenceDate, currentWeek } = params;

  if (isSingleOccurrenceScope(scope)) {
    return {
      kind: "exception",
      exception: {
        slotGroupId: activeSlot.slotGroupId,
        scheduleId: activeSlot.scheduleId,
        date: Timestamp.fromDate(occurrenceDate),
        kind: "cancelled",
      },
    };
  }

  if (scope.kind === "fromNow" || scope.kind === "forever") {
    return {
      kind: "versioning",
      closePrevious: { versionId: activeSlot.id, validToWeek: currentWeek - 1 },
      supersedes: activeSlot.id,
      newVersions: [], // no hay sucesor: la clase deja de existir a partir de aquí
    };
  }

  // scope.kind === "weekRange": "no hay clase durante estas semanas", pero
  // el patrón original vuelve después — no hace falta un "hueco" explícito,
  // la ausencia de versión activa esas semanas ya significa "no hay clase"
  // para el resolver (§14).
  const { fromWeek, toWeek } = scope;
  const originalContent = toClassSlotContent(activeSlot);
  const newVersions: CreateClassSlotDTO[] = [];

  if (toWeek < activeSlot.validToWeek) {
    newVersions.push(
      buildClassSlotDTO(activeSlot, originalContent, {
        validFromWeek: toWeek + 1,
        validToWeek: activeSlot.validToWeek,
        editReason: "weekRange",
      }),
    );
  }

  return {
    kind: "versioning",
    closePrevious: { versionId: activeSlot.id, validToWeek: fromWeek - 1 },
    supersedes: activeSlot.id,
    newVersions,
  };
}

function buildExceptionDTO(
  activeSlot: ClassSlot,
  occurrenceDate: Date,
  changes: Partial<ClassSlotContent>,
): CreateOccurrenceExceptionDTO {
  const touchesTimeOrDay =
    changes.dayOfWeek !== undefined ||
    changes.startMinute !== undefined ||
    changes.endMinute !== undefined;

  return {
    slotGroupId: activeSlot.slotGroupId,
    scheduleId: activeSlot.scheduleId,
    date: Timestamp.fromDate(occurrenceDate),
    kind: touchesTimeOrDay ? "moved" : "modified",
    overrides: changes,
  };
}

function buildClassSlotDTO(
  activeSlot: ClassSlot,
  content: ClassSlotContent,
  vigencia: {
    validFromWeek: number;
    validToWeek: number;
    editReason: CreateClassSlotDTO["editReason"];
  },
): CreateClassSlotDTO {
  return {
    slotGroupId: activeSlot.slotGroupId,
    scheduleId: activeSlot.scheduleId,
    subjectId: activeSlot.subjectId,
    ...content,
    ...vigencia,
  };
}
