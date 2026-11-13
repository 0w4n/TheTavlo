// ─── Decisiones ───────────────────────────────────────────────────────────────

/** Las ÚNICAS respuestas posibles a una decisión rápida de Rise. */
export type DecisionAnswer = "yes" | "no";

export type DecisionKind = "postpone_task" | "reschedule_workday";

// ─── Digest (lo que devuelve el backend, ya con `Date` en vez de ISO) ─────────

export interface RiseTask {
  id: string;
  panelId: string;
  panelName: string;
  title: string;
  endAt: Date;
  progress: "notStarted" | "inProgress";
}

export interface RiseEvent {
  id: string;
  panelId: string;
  panelName: string;
  name: string;
  eventType: string;
  startAt: Date;
  endAt: Date;
  location: string | null;
}

export interface RiseWorkBlock {
  taskId: string;
  panelId: string;
  panelName: string;
  title: string;
  startAt: Date;
  endAt: Date;
  dueAt: Date;
  /** El bloque termina después de la fecha de entrega. */
  atRisk: boolean;
}

export type RiseEffect =
  | { type: "postponed"; previousEndAt: Date; newEndAt: Date }
  | { type: "workPlan"; blocks: RiseWorkBlock[] };

export interface RiseDecisionRecord {
  kind: DecisionKind;
  answer: DecisionAnswer;
  effect: RiseEffect | null;
}

export interface RiseDigest {
  generatedAt: Date;
  horizonHours: number;
  tasks: RiseTask[];
  events: RiseEvent[];
  /** Decisiones ya tomadas hoy, por `decisionId`. */
  decisions: Record<string, RiseDecisionRecord>;
}

// ─── Respuesta a una decisión ─────────────────────────────────────────────────

export interface RiseAnswerInput {
  kind: DecisionKind;
  answer: DecisionAnswer;
  /** Día local del usuario, `YYYY-MM-DD`. */
  dateKey: string;
  panelId?: string;
  taskId?: string;
}

export interface RiseAnswerResult {
  decisionId: string;
  kind: DecisionKind;
  answer: DecisionAnswer;
  applied: boolean;
  alreadyAnswered: boolean;
  effect: RiseEffect | null;
}

// ─── Historias (view-models que consume la UI) ────────────────────────────────

export type RiseUrgency = "overdue" | "urgent" | "soon" | "later";

export interface RiseTaskView extends RiseTask {
  urgency: RiseUrgency;
  /** "Vence hoy 18:00", "Venció hace 3 h", "Mañana 09:00"… */
  dueLabel: string;
}

export interface RiseEventView extends RiseEvent {
  /** "Hoy", "Mañana" o el día de la semana. */
  dayLabel: string;
  /** "09:00 – 10:30" */
  timeLabel: string;
}

export interface RiseStoryDecision {
  /** Mismo id que usa el backend para la idempotencia. */
  id: string;
  kind: DecisionKind;
  question: string;
  hint?: string;
  panelId?: string;
  taskId?: string;
  answered: DecisionAnswer | null;
  effect: RiseEffect | null;
}

export type RiseStory =
  | {
      id: string;
      kind: "intro";
      greeting: string;
      headline: string;
      subline: string;
      stats: { tasks: number; events: number; urgent: number };
    }
  | { id: string; kind: "empty"; greeting: string; headline: string; subline: string }
  | { id: string; kind: "urgent"; title: string; subtitle: string; tasks: RiseTaskView[] }
  | { id: string; kind: "task"; task: RiseTaskView; decision: RiseStoryDecision | null }
  | { id: string; kind: "agenda"; title: string; events: RiseEventView[] }
  | {
      id: string;
      kind: "workday";
      pendingToday: number;
      decision: RiseStoryDecision;
    }
  | {
      id: string;
      kind: "outro";
      headline: string;
      message: string;
      plan: RiseWorkBlock[] | null;
    };

export type RiseStoryKind = RiseStory["kind"];

/** Una historia es "interactiva" si espera un SÍ/NO sin responder todavía. */
export function getPendingDecision(story: RiseStory): RiseStoryDecision | null {
  if (story.kind === "task" || story.kind === "workday") {
    const decision = story.decision;
    return decision && decision.answered === null ? decision : null;
  }
  return null;
}
