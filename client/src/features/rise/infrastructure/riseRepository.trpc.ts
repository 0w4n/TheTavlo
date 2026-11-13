import { trpcMutation, trpcQuery } from "#core/appCore/infrastructure/api/trpcClient";
import type { RiseRepository } from "../app/riseRepository.interface";
import type {
  DecisionAnswer,
  DecisionKind,
  RiseAnswerInput,
  RiseAnswerResult,
  RiseDecisionRecord,
  RiseDigest,
  RiseEffect,
  RiseWorkBlock,
} from "../domain/rise.entity";

// ─── Tipos "de cable": espejo manual de rise.router.ts (client y backend no
// comparten tipos todavía, ver trpcClient.ts). Las fechas viajan como ISO. ───

interface WireWorkBlock {
  taskId: string;
  panelId: string;
  panelName: string;
  title: string;
  startAt: string;
  endAt: string;
  dueAt: string;
  atRisk: boolean;
}

type WireEffect =
  | { type: "postponed"; previousEndAt: string; newEndAt: string }
  | { type: "workPlan"; blocks: WireWorkBlock[] };

interface WireDigest {
  generatedAt: string;
  horizonHours: number;
  tasks: Array<{
    id: string;
    panelId: string;
    panelName: string;
    title: string;
    endAt: string;
    progress: "notStarted" | "inProgress";
  }>;
  events: Array<{
    id: string;
    panelId: string;
    panelName: string;
    name: string;
    eventType: string;
    startAt: string;
    endAt: string;
    location: string | null;
  }>;
  decisions: Record<string, { kind: DecisionKind; answer: DecisionAnswer; effect: WireEffect | null }>;
}

interface WireAnswerResult {
  decisionId: string;
  kind: DecisionKind;
  answer: DecisionAnswer;
  applied: boolean;
  alreadyAnswered: boolean;
  effect: WireEffect | null;
}

// ─── Mapeo wire → dominio ─────────────────────────────────────────────────────

function toBlock(block: WireWorkBlock): RiseWorkBlock {
  return {
    ...block,
    startAt: new Date(block.startAt),
    endAt: new Date(block.endAt),
    dueAt: new Date(block.dueAt),
  };
}

function toEffect(effect: WireEffect | null): RiseEffect | null {
  if (!effect) return null;
  if (effect.type === "postponed") {
    return {
      type: "postponed",
      previousEndAt: new Date(effect.previousEndAt),
      newEndAt: new Date(effect.newEndAt),
    };
  }
  return { type: "workPlan", blocks: effect.blocks.map(toBlock) };
}

function toDigest(wire: WireDigest): RiseDigest {
  const decisions: Record<string, RiseDecisionRecord> = {};
  for (const [id, record] of Object.entries(wire.decisions)) {
    decisions[id] = { kind: record.kind, answer: record.answer, effect: toEffect(record.effect) };
  }
  return {
    generatedAt: new Date(wire.generatedAt),
    horizonHours: wire.horizonHours,
    tasks: wire.tasks.map((task) => ({ ...task, endAt: new Date(task.endAt) })),
    events: wire.events.map((event) => ({
      ...event,
      startAt: new Date(event.startAt),
      endAt: new Date(event.endAt),
    })),
    decisions,
  };
}

export class TrpcRiseRepository implements RiseRepository {
  async getDigest(dateKey: string): Promise<RiseDigest> {
    return toDigest(await trpcQuery<WireDigest>("rise.digest", { dateKey }));
  }

  async answer(input: RiseAnswerInput): Promise<RiseAnswerResult> {
    const wire = await trpcMutation<WireAnswerResult>("rise.answer", input);
    return { ...wire, effect: toEffect(wire.effect) };
  }
}
