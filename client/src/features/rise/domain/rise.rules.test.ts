import { describe, expect, it } from "vitest";
import type { RiseDigest, RiseTask } from "./rise.entity";
import { RiseRules, WORKDAY_DECISION_ID } from "./rise.rules";

const NOW = new Date(2026, 10, 11, 9, 0, 0); // 11-nov-2026 09:00 local
const H = 3_600_000;

const task = (id: string, hours: number, progress: RiseTask["progress"] = "notStarted"): RiseTask => ({
  id,
  panelId: "p1",
  panelName: "Universidad",
  title: `Tarea ${id}`,
  endAt: new Date(NOW.getTime() + hours * H),
  progress,
});

const digest = (over: Partial<RiseDigest> = {}): RiseDigest => ({
  generatedAt: NOW,
  horizonHours: 48,
  tasks: [],
  events: [],
  decisions: {},
  ...over,
});

const build = (d: RiseDigest) => RiseRules.buildStories({ digest: d, now: NOW, userName: "Ana" });

describe("RiseRules.buildStories", () => {
  it("sin pendientes devuelve una única historia 'empty'", () => {
    const stories = build(digest());
    expect(stories).toHaveLength(1);
    expect(stories[0]?.kind).toBe("empty");
  });

  it("empieza con intro y termina con outro; saluda por nombre", () => {
    const stories = build(digest({ tasks: [task("a", 10)] }));
    expect(stories[0]?.kind).toBe("intro");
    expect(stories.at(-1)?.kind).toBe("outro");
    expect(stories[0]).toMatchObject({ greeting: "Buenos días, Ana" });
  });

  it("ofrece posponer solo tareas sin empezar que vencen entre 2 y 24 h, máx. 2", () => {
    const stories = build(
      digest({
        tasks: [task("urgent", 1), task("a", 5), task("b", 8), task("c", 12), task("started", 6, "inProgress"), task("far", 30)],
      }),
    );
    const withDecision = stories.filter((s) => s.kind === "task" && s.decision).map((s) => (s.kind === "task" ? s.task.id : ""));
    expect(withDecision).toEqual(["a", "b"]);
  });

  it("usa el mismo id de decisión que el backend", () => {
    expect(RiseRules.postponeDecisionId("p1", "t9")).toBe("postpone_p1_t9");
  });

  it("propone reprogramar el horario con ≥2 entregas en 24 h", () => {
    expect(build(digest({ tasks: [task("a", 5)] })).some((s) => s.kind === "workday")).toBe(false);
    expect(build(digest({ tasks: [task("a", 5), task("b", 6)] })).some((s) => s.kind === "workday")).toBe(true);
  });

  it("una decisión ya respondida hoy aparece como respondida (no se vuelve a preguntar)", () => {
    const id = RiseRules.postponeDecisionId("p1", "a");
    const stories = build(digest({ tasks: [task("a", 5)], decisions: { [id]: { kind: "postpone_task", answer: "no", effect: null } } }));
    const story = stories.find((s) => s.kind === "task");
    expect(story?.kind === "task" && story.decision?.answered).toBe("no");
  });

  it("agrupa urgentes en una historia solo si hay 2 o más", () => {
    expect(build(digest({ tasks: [task("a", 1)] })).some((s) => s.kind === "urgent")).toBe(false);
    expect(build(digest({ tasks: [task("a", 1), task("b", -2)] })).some((s) => s.kind === "urgent")).toBe(true);
  });
});

describe("RiseRules.applyDecision", () => {
  it("pospone: marca respuesta, actualiza la fecha y NO reordena las historias", () => {
    const stories = build(digest({ tasks: [task("a", 5), task("b", 6)] }));
    const id = RiseRules.postponeDecisionId("p1", "a");
    const newEndAt = new Date(NOW.getTime() + 29 * H);

    const next = RiseRules.applyDecision(
      stories,
      { decisionId: id, kind: "postpone_task", answer: "yes", applied: true, alreadyAnswered: false, effect: { type: "postponed", previousEndAt: new Date(NOW.getTime() + 5 * H), newEndAt } },
      NOW,
    );

    expect(next.map((s) => s.id)).toEqual(stories.map((s) => s.id));
    const patched = next.find((s) => s.kind === "task" && s.task.id === "a");
    expect(patched?.kind === "task" && patched.task.endAt).toEqual(newEndAt);
    expect(patched?.kind === "task" && patched.decision?.answered).toBe("yes");
  });

  it("workday sí: el cierre recibe el plan", () => {
    const stories = build(digest({ tasks: [task("a", 5), task("b", 6)] }));
    const blocks = [{ taskId: "a", panelId: "p1", panelName: "U", title: "A", startAt: NOW, endAt: new Date(NOW.getTime() + H), dueAt: new Date(NOW.getTime() + 5 * H), atRisk: false }];
    const next = RiseRules.applyDecision(
      stories,
      { decisionId: WORKDAY_DECISION_ID, kind: "reschedule_workday", answer: "yes", applied: true, alreadyAnswered: false, effect: { type: "workPlan", blocks } },
      NOW,
    );
    const outro = next.at(-1);
    expect(outro?.kind === "outro" && outro.plan).toEqual(blocks);
  });
});

describe("RiseRules labels", () => {
  it("dueLabel distingue vencida, inminente, hoy y mañana", () => {
    expect(RiseRules.dueLabel(new Date(NOW.getTime() - 3 * H), NOW)).toBe("Venció hace 3 h");
    expect(RiseRules.dueLabel(new Date(NOW.getTime() + 25 * 60_000), NOW)).toBe("Vence en 25 min");
    expect(RiseRules.dueLabel(new Date(2026, 10, 11, 18, 0), NOW)).toBe("Vence hoy 18:00");
    expect(RiseRules.dueLabel(new Date(2026, 10, 12, 9, 30), NOW)).toBe("Vence mañana 09:30");
  });

  it("toDateKey usa el día local", () => {
    expect(RiseRules.toDateKey(NOW)).toBe("2026-11-11");
  });
});
