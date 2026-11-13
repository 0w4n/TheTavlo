import type {
  RiseAnswerResult,
  RiseDigest,
  RiseEvent,
  RiseEventView,
  RiseStory,
  RiseStoryDecision,
  RiseTask,
  RiseTaskView,
  RiseUrgency,
  RiseWorkBlock,
} from "./rise.entity";

const HOUR_MS = 3_600_000;
const MINUTE_MS = 60_000;
const DAY_MS = 24 * HOUR_MS;
const LOCALE = "es-ES";

/** Una tarea pasa a "urgente" cuando faltan menos de estas horas. */
export const URGENT_HOURS = 6;
/** No ofrecemos posponer algo que vence en menos de estas horas (sería absurdo). */
export const POSTPONE_MIN_HOURS = 2;
/** Mínimo de entregas en 24 h para proponer reprogramar el horario. */
export const WORKDAY_MIN_PENDING = 2;

const MAX_TASK_STORIES = 5;
const MAX_POSTPONE_DECISIONS = 2;
const MAX_AGENDA_EVENTS = 5;
const MAX_URGENT_LIST = 4;

export const WORKDAY_DECISION_ID = "workday";

const MOTIVATION = [
  "Un paso pequeño ahora vale más que un plan perfecto después.",
  "No hace falta hacerlo todo: hace falta empezar por lo importante.",
  "Lo que hoy cuesta, mañana será rutina. Tú puedes.",
  "Respira, ordena y avanza. Ya tienes el mapa del día.",
  "Cada tarea cerrada es espacio libre en tu cabeza.",
] as const;

export interface BuildStoriesInput {
  digest: RiseDigest;
  now: Date;
  userName: string | null;
}

export interface DecisionOutcome {
  tone: "yes" | "no";
  title: string;
  detail: string;
}

export class RiseRules {
  // ─── Identificadores y fechas ───────────────────────────────────────────────

  /** Día LOCAL del usuario en `YYYY-MM-DD` (la sesión de Rise es por día local). */
  static toDateKey(date: Date): string {
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${date.getFullYear()}-${month}-${day}`;
  }

  /** Debe coincidir con `decisionIdOf` del backend (rise.router.ts). */
  static postponeDecisionId(panelId: string, taskId: string): string {
    return `postpone_${panelId}_${taskId}`;
  }

  static greetingFor(now: Date): string {
    const hour = now.getHours();
    if (hour < 14) return "Buenos días";
    if (hour < 20) return "Buenas tardes";
    return "Buenas noches";
  }

  static classifyUrgency(endAt: Date, now: Date): RiseUrgency {
    const diff = endAt.getTime() - now.getTime();
    if (diff < 0) return "overdue";
    if (diff <= URGENT_HOURS * HOUR_MS) return "urgent";
    if (diff <= 24 * HOUR_MS) return "soon";
    return "later";
  }

  private static isSameDay(a: Date, b: Date): boolean {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  private static time(date: Date): string {
    return new Intl.DateTimeFormat(LOCALE, { hour: "2-digit", minute: "2-digit" }).format(date);
  }

  static dayLabel(date: Date, now: Date): string {
    if (this.isSameDay(date, now)) return "Hoy";
    if (this.isSameDay(date, new Date(now.getTime() + DAY_MS))) return "Mañana";
    const weekday = new Intl.DateTimeFormat(LOCALE, { weekday: "long" }).format(date);
    return weekday.charAt(0).toUpperCase() + weekday.slice(1);
  }

  private static elapsed(ms: number): string {
    const minutes = Math.max(1, Math.round(ms / MINUTE_MS));
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.round(minutes / 60);
    if (hours < 48) return `${hours} h`;
    return `${Math.round(hours / 24)} d`;
  }

  static dueLabel(endAt: Date, now: Date): string {
    const diff = endAt.getTime() - now.getTime();
    if (diff < 0) return `Venció hace ${this.elapsed(-diff)}`;
    if (diff < HOUR_MS) return `Vence en ${this.elapsed(diff)}`;
    return `Vence ${this.dayLabel(endAt, now).toLowerCase()} ${this.time(endAt)}`;
  }

  static timeRangeLabel(start: Date, end: Date): string {
    if (end.getTime() <= start.getTime()) return this.time(start);
    return `${this.time(start)} – ${this.time(end)}`;
  }

  // ─── View-models ────────────────────────────────────────────────────────────

  static toTaskView(task: RiseTask, now: Date): RiseTaskView {
    return {
      ...task,
      urgency: this.classifyUrgency(task.endAt, now),
      dueLabel: this.dueLabel(task.endAt, now),
    };
  }

  static toEventView(event: RiseEvent, now: Date): RiseEventView {
    return {
      ...event,
      dayLabel: this.dayLabel(event.startAt, now),
      timeLabel: this.timeRangeLabel(event.startAt, event.endAt),
    };
  }

  // ─── Copy ───────────────────────────────────────────────────────────────────

  private static plural(count: number, one: string, many: string): string {
    return `${count} ${count === 1 ? one : many}`;
  }

  /** Mismo mensaje para el mismo día: no cambia en cada render ni al reabrir. */
  private static pickBySeed<T>(items: readonly T[], seed: string): T {
    let hash = 0;
    for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
    return items[hash % items.length] as T;
  }

  // ─── Construcción de historias ──────────────────────────────────────────────

  /**
   * Convierte el digest en la lista ordenada de historias. Es una FOTO: se
   * construye una vez al abrir Rise y luego solo se parchea con
   * `applyDecision` (así los índices no se mueven mientras el usuario navega).
   */
  static buildStories({ digest, now, userName }: BuildStoriesInput): RiseStory[] {
    const name = userName?.trim() ? userName.trim() : null;
    const greeting = `${this.greetingFor(now)}${name ? `, ${name}` : ""}`;
    const dateKey = this.toDateKey(now);

    const tasks = [...digest.tasks]
      .sort((a, b) => a.endAt.getTime() - b.endAt.getTime())
      .map((task) => this.toTaskView(task, now));
    const events = [...digest.events]
      .sort((a, b) => a.startAt.getTime() - b.startAt.getTime())
      .map((event) => this.toEventView(event, now));

    if (tasks.length === 0 && events.length === 0) {
      return [
        {
          id: "empty",
          kind: "empty",
          greeting,
          headline: "Todo al día",
          subline: `No tienes nada pendiente en las próximas ${digest.horizonHours} h. Disfruta el respiro o adelanta algo.`,
        },
      ];
    }

    const urgentTasks = tasks.filter((task) => task.urgency === "overdue" || task.urgency === "urgent");

    const stories: RiseStory[] = [];

    // 1 · Intro
    stories.push({
      id: "intro",
      kind: "intro",
      greeting,
      headline:
        urgentTasks.length > 0
          ? "Hay cosas que no pueden esperar"
          : tasks.length > 0
            ? "Tu día, bajo control"
            : "Día de agenda",
      subline:
        urgentTasks.length > 0
          ? `${this.plural(urgentTasks.length, "entrega necesita", "entregas necesitan")} atención ya. Vamos paso a paso.`
          : tasks.length > 0
            ? `Tienes ${this.plural(tasks.length, "pendiente", "pendientes")} en las próximas ${digest.horizonHours} h. Una a una.`
            : `Sin entregas pendientes y ${this.plural(events.length, "evento", "eventos")} en camino.`,
      stats: { tasks: tasks.length, events: events.length, urgent: urgentTasks.length },
    });

    // 2 · Resumen de urgentes (solo si hay varias; una sola tiene su propia tarjeta)
    if (urgentTasks.length >= 2) {
      stories.push({
        id: "urgent",
        kind: "urgent",
        title: "Lo primero, lo urgente",
        subtitle: "Esto vence en las próximas horas o ya venció.",
        tasks: urgentTasks.slice(0, MAX_URGENT_LIST),
      });
    }

    // 3 · Una historia por tarea (las más próximas), con SÍ/NO cuando tiene sentido
    const visibleTasks = tasks.slice(0, MAX_TASK_STORIES);
    const hiddenTasks = tasks.length - visibleTasks.length;
    let freshPostponeDecisions = 0;

    for (const task of visibleTasks) {
      const decisionId = this.postponeDecisionId(task.panelId, task.id);
      const record = digest.decisions[decisionId];
      const hoursLeft = (task.endAt.getTime() - now.getTime()) / HOUR_MS;
      const eligible =
        task.progress === "notStarted" &&
        hoursLeft >= POSTPONE_MIN_HOURS &&
        hoursLeft <= 24 &&
        freshPostponeDecisions < MAX_POSTPONE_DECISIONS;

      let decision: RiseStoryDecision | null = null;
      if (record || eligible) {
        if (!record) freshPostponeDecisions += 1;
        decision = {
          id: decisionId,
          kind: "postpone_task",
          question: "¿Quieres posponer esto a mañana?",
          hint: `Pasaría a: ${this.dueLabel(new Date(task.endAt.getTime() + DAY_MS), now).replace(/^Vence /, "")}`,
          panelId: task.panelId,
          taskId: task.id,
          answered: record?.answer ?? null,
          effect: record?.effect ?? null,
        };
      }

      stories.push({ id: `task:${task.panelId}:${task.id}`, kind: "task", task, decision });
    }

    // 4 · Agenda
    if (events.length > 0) {
      stories.push({
        id: "agenda",
        kind: "agenda",
        title: "Tu agenda",
        events: events.slice(0, MAX_AGENDA_EVENTS),
      });
    }

    // 5 · Reprogramar el horario de hoy (si hay carga)
    const pendingToday = tasks.filter((task) => task.endAt.getTime() <= now.getTime() + DAY_MS).length;
    const workdayRecord = digest.decisions[WORKDAY_DECISION_ID];
    if (pendingToday >= WORKDAY_MIN_PENDING || workdayRecord) {
      stories.push({
        id: "workday",
        kind: "workday",
        pendingToday,
        decision: {
          id: WORKDAY_DECISION_ID,
          kind: "reschedule_workday",
          question: "¿Quieres reprogramar tu horario de trabajo para hoy?",
          hint: "Te propongo bloques de enfoque de 50 min, empezando por lo más urgente.",
          answered: workdayRecord?.answer ?? null,
          effect: workdayRecord?.effect ?? null,
        },
      });
    }

    // 6 · Cierre
    const workPlan = workdayRecord?.effect?.type === "workPlan" ? workdayRecord.effect.blocks : null;
    const motivation = this.pickBySeed(MOTIVATION, dateKey);
    stories.push({
      id: "outro",
      kind: "outro",
      headline: "Listo. A por ello",
      message: hiddenTasks > 0 ? `${motivation} Y ${this.plural(hiddenTasks, "pendiente más te espera", "pendientes más te esperan")} en tus paneles.` : motivation,
      plan: workPlan,
    });

    return stories;
  }

  // ─── Aplicar una respuesta sin reordenar las historias ──────────────────────

  static applyDecision(stories: RiseStory[], result: RiseAnswerResult, now: Date): RiseStory[] {
    return stories.map((story) => {
      if ((story.kind === "task" || story.kind === "workday") && story.decision?.id === result.decisionId) {
        const decision: RiseStoryDecision = { ...story.decision, answered: result.answer, effect: result.effect };

        if (story.kind === "task" && result.effect?.type === "postponed") {
          return { ...story, decision, task: this.toTaskView({ ...story.task, endAt: result.effect.newEndAt }, now) };
        }
        if (story.kind === "task") return { ...story, decision };
        return { ...story, decision };
      }

      if (story.kind === "outro" && result.effect?.type === "workPlan") {
        return { ...story, plan: result.effect.blocks };
      }
      return story;
    });
  }

  /** Texto del "resultado" que se muestra en lugar de los botones al responder. */
  static describeOutcome(decision: RiseStoryDecision, now: Date): DecisionOutcome | null {
    if (!decision.answered) return null;
    const yes = decision.answered === "yes";

    if (decision.kind === "postpone_task") {
      if (!yes) return { tone: "no", title: "Se queda como está", detail: "Mantenemos la fecha original." };
      const effect = decision.effect;
      return {
        tone: "yes",
        title: "Pospuesta a mañana",
        detail: effect?.type === "postponed" ? `Nueva entrega: ${this.dueLabel(effect.newEndAt, now).replace(/^Vence /, "")}` : "Hecho.",
      };
    }

    if (!yes) return { tone: "no", title: "Horario sin cambios", detail: "Seguimos con tu plan actual." };
    const blocks: RiseWorkBlock[] = decision.effect?.type === "workPlan" ? decision.effect.blocks : [];
    return {
      tone: "yes",
      title: "Horario reprogramado",
      detail:
        blocks.length > 0
          ? `${this.plural(blocks.length, "bloque de enfoque listo", "bloques de enfoque listos")}. Míralos al final.`
          : "No había nada que planificar para hoy.",
    };
  }

  static blockTimeLabel(block: RiseWorkBlock): string {
    return this.timeRangeLabel(block.startAt, block.endAt);
  }
}