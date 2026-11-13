import { TRPCError } from "@trpc/server";
import type { DocumentData, Firestore } from "firebase-admin/firestore";
import { router, protectedProcedure } from "../../trpc/trpc.js";
import { asObject, asOneOf, asString } from "../../trpc/validate.js";

/**
 * Rise ("historias" del día).
 *
 * - `rise.digest`  → resumen de lo PENDIENTE en las próximas 24/48 h
 *                    (tareas sin entregar + eventos) agregado sobre TODOS los
 *                    paneles propios del usuario, más las decisiones que ya
 *                    tomó hoy (para no volver a preguntárselas).
 * - `rise.answer`  → decisión rápida SÍ/NO. Solo existen dos respuestas
 *                    posibles ("yes" | "no") y se validan aquí, no solo en la UI.
 *
 * Persistencia (solo accesible por backend/Admin SDK, ver firebase.rules):
 *   {accountType}/{uid}/riseSessions/{YYYY-MM-DD}                    (doc "sesión")
 *   {accountType}/{uid}/riseSessions/{YYYY-MM-DD}/decisions/{id}     (1 doc por decisión)
 */

// ─── Constantes ───────────────────────────────────────────────────────────────

const HOUR_MS = 3_600_000;
const DAY_MS = 24 * HOUR_MS;
const HORIZON_HOURS = 48;
const OVERDUE_LOOKBACK_DAYS = 7;

const FOCUS_MINUTES = 50;
const BREAK_MINUTES = 10;
const MAX_WORK_BLOCKS = 6;

const DECISION_KINDS = ["postpone_task", "reschedule_workday"] as const;
const ANSWERS = ["yes", "no"] as const;

type DecisionKind = (typeof DECISION_KINDS)[number];
type Answer = (typeof ANSWERS)[number];
type AccountType = "users" | "guests";

const DATE_KEY_RE = /^\d{4}-\d{2}-\d{2}$/;
const SAFE_ID_RE = /^[A-Za-z0-9_-]{1,128}$/;

// ─── Tipos de respuesta (espejo de client/features/rise/domain/rise.entity.ts) ─

interface DigestTask {
  kind: "task";
  id: string;
  panelId: string;
  panelName: string;
  title: string;
  endAt: string; // ISO
  progress: "notStarted" | "inProgress";
}

interface DigestEvent {
  kind: "event";
  id: string;
  panelId: string;
  panelName: string;
  name: string;
  eventType: string;
  startAt: string; // ISO
  endAt: string; // ISO
  location: string | null;
}

interface WorkBlock {
  taskId: string;
  panelId: string;
  panelName: string;
  title: string;
  startAt: string;
  endAt: string;
  dueAt: string;
  atRisk: boolean;
}

type DecisionEffect =
  | { type: "postponed"; previousEndAt: string; newEndAt: string }
  | { type: "workPlan"; blocks: WorkBlock[] };

interface StoredDecision {
  kind: DecisionKind;
  answer: Answer;
  effect: DecisionEffect | null;
}

// ─── Helpers de fecha (Firestore puede tener Timestamp, Date o ISO string) ────
//
// Los repos del cliente escriben tareas/eventos por dos caminos: Firestore
// directo (Timestamp) y tRPC (`encode` → ISO string). Para no perder datos por
// ese tipo mixto, TODA lectura pasa por `toDate` y NO se filtra por rango en la
// query de Firestore (una comparación contra Timestamp ignora los strings).

function toDate(value: unknown): Date | null {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (value && typeof value === "object" && "toDate" in value && typeof value.toDate === "function") {
    const date = (value as { toDate: () => Date }).toDate();
    return Number.isNaN(date.getTime()) ? null : date;
  }
  if (typeof value === "string") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  return null;
}

/** Desplaza una fecha conservando el tipo con el que estaba guardada. */
function shiftLike(original: unknown, deltaMs: number): Date | string {
  const base = toDate(original);
  if (!base) throw new TRPCError({ code: "BAD_REQUEST", message: "La fecha de la tarea no es válida." });
  const shifted = new Date(base.getTime() + deltaMs);
  return typeof original === "string" ? shifted.toISOString() : shifted;
}

function ceilToQuarterHour(date: Date): Date {
  const quarter = 15 * 60_000;
  return new Date(Math.ceil(date.getTime() / quarter) * quarter);
}

// ─── Validación de input (sin zod, igual que el resto de routers) ─────────────

function parseDateKey(raw: unknown): string {
  const value = asString(raw, "dateKey");
  if (!DATE_KEY_RE.test(value) || Number.isNaN(new Date(`${value}T00:00:00Z`).getTime())) {
    throw new TRPCError({ code: "BAD_REQUEST", message: '"dateKey" debe tener formato YYYY-MM-DD.' });
  }
  return value;
}

function parseSafeId(raw: unknown, field: string): string {
  const value = asString(raw, field);
  if (!SAFE_ID_RE.test(value)) {
    throw new TRPCError({ code: "BAD_REQUEST", message: `"${field}" no es un identificador válido.` });
  }
  return value;
}

interface AnswerInput {
  kind: DecisionKind;
  answer: Answer;
  dateKey: string;
  panelId: string | null;
  taskId: string | null;
}

function parseAnswerInput(raw: unknown): AnswerInput {
  const value = asObject(raw);
  const kind = asOneOf(value.kind, DECISION_KINDS, "kind");
  // ÚNICAS respuestas admitidas: SÍ / NO.
  const answer = asOneOf(value.answer, ANSWERS, "answer");
  const dateKey = parseDateKey(value.dateKey);

  if (kind === "postpone_task") {
    return { kind, answer, dateKey, panelId: parseSafeId(value.panelId, "panelId"), taskId: parseSafeId(value.taskId, "taskId") };
  }
  return { kind, answer, dateKey, panelId: null, taskId: null };
}

// ─── Acceso a Firestore ───────────────────────────────────────────────────────

interface AuthedCtx {
  user: { uid: string; isAnonymous: boolean };
  db: Firestore;
}

function accountTypeOf(ctx: AuthedCtx): AccountType {
  return ctx.user.isAnonymous ? "guests" : "users";
}

function decisionIdOf(input: AnswerInput): string {
  return input.kind === "postpone_task" ? `postpone_${input.panelId}_${input.taskId}` : "workday";
}

/**
 * Agrega tareas y eventos pendientes de los paneles propios (no archivados).
 *
 * Alcance v1: solo paneles propios. Los compartidos requerirían recorrer
 * `sharedPanelIndex/{uid}/panels` y resolver el owner de cada uno.
 * Los eventos con recurrencia (`recurrence.rules`) NO se expanden: se listan
 * únicamente por su `startAt` original.
 */
async function collectPending(
  ctx: AuthedCtx,
  now: Date,
): Promise<{ tasks: DigestTask[]; events: DigestEvent[] }> {
  const accountType = accountTypeOf(ctx);
  const windowEnd = new Date(now.getTime() + HORIZON_HOURS * HOUR_MS);
  const lookback = new Date(now.getTime() - OVERDUE_LOOKBACK_DAYS * DAY_MS);

  const panelsSnapshot = await ctx.db.collection(`${accountType}/${ctx.user.uid}/panels`).get();
  const panels = panelsSnapshot.docs.filter((panel) => panel.data().isArchived !== true);

  const perPanel = await Promise.all(
    panels.map(async (panel) => {
      const panelName = typeof panel.data().name === "string" && panel.data().name ? (panel.data().name as string) : "Panel";

      const [tasksSnapshot, eventsSnapshot] = await Promise.all([
        // `!=` descarta de paso los NodeTask (no tienen `progress`) y las ya entregadas.
        panel.ref.collection("tasks").where("progress", "!=", "submitted").get(),
        panel.ref.collection("event").get(),
      ]);

      const tasks: DigestTask[] = [];
      for (const document of tasksSnapshot.docs) {
        const data = document.data();
        const endAt = toDate(data.endAt);
        if (!endAt || endAt > windowEnd || endAt < lookback) continue;
        tasks.push({
          kind: "task",
          id: document.id,
          panelId: panel.id,
          panelName,
          title: typeof data.title === "string" && data.title ? data.title : "Tarea sin título",
          endAt: endAt.toISOString(),
          progress: data.progress === "inProgress" ? "inProgress" : "notStarted",
        });
      }

      const events: DigestEvent[] = [];
      for (const document of eventsSnapshot.docs) {
        const data = document.data();
        const isExam = data.type === "exam";
        const startAt = toDate(isExam ? data.makeAt : data.startAt);
        if (!startAt) continue;
        const explicitEnd = isExam
          ? typeof data.time === "number" ? new Date(startAt.getTime() + data.time * 60_000) : null
          : toDate(data.endAt);
        const endAt = explicitEnd ?? startAt;
        // Futuro dentro de la ventana, o en curso ahora mismo.
        if (endAt < now || startAt > windowEnd) continue;

        const rawLocation = data.location;
        const location =
          typeof rawLocation === "string" ? rawLocation
          : rawLocation && typeof rawLocation === "object" && typeof rawLocation.address === "string" ? rawLocation.address
          : null;

        events.push({
          kind: "event",
          id: document.id,
          panelId: panel.id,
          panelName,
          name: typeof data.name === "string" && data.name ? data.name : "Evento sin título",
          eventType: typeof data.type === "string" ? data.type : "generic",
          startAt: startAt.toISOString(),
          endAt: endAt.toISOString(),
          location,
        });
      }

      return { tasks, events };
    }),
  );

  return {
    tasks: perPanel.flatMap((entry) => entry.tasks).sort((a, b) => a.endAt.localeCompare(b.endAt)),
    events: perPanel.flatMap((entry) => entry.events).sort((a, b) => a.startAt.localeCompare(b.startAt)),
  };
}

/**
 * Plan de trabajo para "reprogramar el horario de hoy": bloques de enfoque
 * (50' + 10' de descanso) para las tareas que vencen en las próximas 24 h,
 * ordenadas por urgencia, empezando en el próximo cuarto de hora.
 * No toca las tareas: solo propone un orden y marca las que llegarían tarde.
 */
function buildWorkPlan(tasks: DigestTask[], now: Date): WorkBlock[] {
  const limit = now.getTime() + DAY_MS;
  const candidates = tasks
    .filter((task) => new Date(task.endAt).getTime() <= limit)
    .sort((a, b) => a.endAt.localeCompare(b.endAt))
    .slice(0, MAX_WORK_BLOCKS);

  const blocks: WorkBlock[] = [];
  let cursor = ceilToQuarterHour(now);
  for (const task of candidates) {
    const start = cursor;
    const end = new Date(start.getTime() + FOCUS_MINUTES * 60_000);
    blocks.push({
      taskId: task.id,
      panelId: task.panelId,
      panelName: task.panelName,
      title: task.title,
      startAt: start.toISOString(),
      endAt: end.toISOString(),
      dueAt: task.endAt,
      atRisk: end.getTime() > new Date(task.endAt).getTime(),
    });
    cursor = new Date(end.getTime() + BREAK_MINUTES * 60_000);
  }
  return blocks;
}

// ─── Router ───────────────────────────────────────────────────────────────────

export const riseRouter = router({
  digest: protectedProcedure
    .input((raw) => ({ dateKey: parseDateKey(asObject(raw).dateKey) }))
    .query(async ({ ctx, input }) => {
      const now = new Date();
      const accountType = accountTypeOf(ctx);

      const [pending, decisionsSnapshot] = await Promise.all([
        collectPending(ctx, now),
        ctx.db.collection(`${accountType}/${ctx.user.uid}/riseSessions/${input.dateKey}/decisions`).get(),
      ]);

      const decisions: Record<string, StoredDecision> = {};
      for (const document of decisionsSnapshot.docs) {
        const data = document.data();
        decisions[document.id] = { kind: data.kind, answer: data.answer, effect: data.effect ?? null };
      }

      return {
        generatedAt: now.toISOString(),
        horizonHours: HORIZON_HOURS,
        tasks: pending.tasks,
        events: pending.events,
        decisions,
      };
    }),

  answer: protectedProcedure.input(parseAnswerInput).mutation(async ({ ctx, input }) => {
    const now = new Date();
    const accountType = accountTypeOf(ctx);
    const base = `${accountType}/${ctx.user.uid}`;
    const decisionId = decisionIdOf(input);
    const sessionRef = ctx.db.doc(`${base}/riseSessions/${input.dateKey}`);
    const decisionRef = sessionRef.collection("decisions").doc(decisionId);
    const taskRef =
      input.kind === "postpone_task" ? ctx.db.doc(`${base}/panels/${input.panelId}/tasks/${input.taskId}`) : null;

    // Se calcula FUERA de la transacción: Firestore exige todas las lecturas
    // antes que las escrituras, y esto lee muchos documentos de otras rutas.
    const workPlan =
      input.answer === "yes" && input.kind === "reschedule_workday"
        ? buildWorkPlan((await collectPending(ctx, now)).tasks, now)
        : null;

    return ctx.db.runTransaction(async (transaction) => {
      // Idempotencia: una decisión por día. Un doble clic o un reintento de red
      // NO vuelve a posponer la tarea otro día más.
      const existing = await transaction.get(decisionRef);
      if (existing.exists) {
        const data = existing.data() as DocumentData;
        return {
          decisionId,
          kind: input.kind,
          answer: data.answer as Answer,
          applied: data.answer === "yes",
          alreadyAnswered: true,
          effect: (data.effect ?? null) as DecisionEffect | null,
        };
      }

      let effect: DecisionEffect | null = null;

      if (input.answer === "yes" && input.kind === "postpone_task" && taskRef) {
        const taskSnapshot = await transaction.get(taskRef);
        if (!taskSnapshot.exists) throw new TRPCError({ code: "NOT_FOUND", message: "La tarea ya no existe." });
        const task = taskSnapshot.data() as DocumentData;
        if (task.progress === "submitted") {
          throw new TRPCError({ code: "BAD_REQUEST", message: "La tarea ya está finalizada." });
        }
        const currentEnd = toDate(task.endAt);
        if (!currentEnd) throw new TRPCError({ code: "BAD_REQUEST", message: "La tarea no tiene fecha de entrega." });
        if (currentEnd.getTime() < now.getTime()) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "La tarea ya venció: elige una nueva fecha desde la tarea." });
        }

        const nextEndAt = shiftLike(task.endAt, DAY_MS);
        const changes: DocumentData = { endAt: nextEndAt, updatedAt: now };
        if (task.openAt != null && toDate(task.openAt)) changes.openAt = shiftLike(task.openAt, DAY_MS);
        transaction.update(taskRef, changes);

        effect = {
          type: "postponed",
          previousEndAt: currentEnd.toISOString(),
          newEndAt: (toDate(nextEndAt) as Date).toISOString(),
        };
      }

      if (workPlan) effect = { type: "workPlan", blocks: workPlan };

      transaction.set(sessionRef, { updatedAt: now }, { merge: true });
      transaction.set(decisionRef, {
        kind: input.kind,
        answer: input.answer,
        effect,
        panelId: input.panelId,
        taskId: input.taskId,
        answeredAt: now,
      });

      return {
        decisionId,
        kind: input.kind,
        answer: input.answer,
        applied: input.answer === "yes",
        alreadyAnswered: false,
        effect,
      };
    });
  }),
});
