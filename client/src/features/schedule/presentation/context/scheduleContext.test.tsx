import { describe, expect, it } from "vitest";
import { act, render, screen, waitFor } from "@testing-library/react";
import { Timestamp } from "firebase/firestore";
import { ScheduleService } from "../../app/schedule.service";
import { createFakeScheduleRepository } from "../../infrastructure/__fixtures__/fakeScheduleRepository";
import { buildScheduleSeed } from "../__fixtures__/scheduleSeed";
import useSchedule from "../hooks/useSchedule";
import { ScheduleProvider, type ScheduleContextValue } from "./scheduleContext";

function setup(seed: Parameters<typeof createFakeScheduleRepository>[0]) {
  const repo = createFakeScheduleRepository(seed);
  let ctx!: ScheduleContextValue;
  const Probe = () => {
    ctx = useSchedule();
    return <span data-testid="status">{ctx.state.status}</span>;
  };
  render(
    <ScheduleProvider scheduleService={new ScheduleService(repo.repository)} now={() => new Date(2026, 9, 26, 11, 20)}>
      <Probe />
    </ScheduleProvider>,
  );
  return { repo, ctx: () => ctx };
}

describe("ScheduleProvider", () => {
  it("sin horario en el panel → status 'empty'", async () => {
    setup(undefined);
    await waitFor(() => expect(screen.getByTestId("status").textContent).toBe("empty"));
  });

  it("con datos completos → 'ready'", async () => {
    setup(buildScheduleSeed());
    await waitFor(() => expect(screen.getByTestId("status").textContent).toBe("ready"));
  });

  it("resolveWeek no incluye clases de asignaturas archivadas", async () => {
    const { ctx } = setup(buildScheduleSeed());
    await waitFor(() => expect(ctx().state.status).toBe("ready"));
    const groups = ctx().resolveWeek(7).map((i) => i.slotGroupId);
    expect(groups).not.toContain("g-old-thu");
    expect(groups).toContain("g-alg-mon");
  });

  it("recorta la semana parcial: nada antes del inicio del periodo", async () => {
    const seed = buildScheduleSeed();
    // El periodo empieza el miércoles 16 sep (semana 1 parcial: lun 14 y mar 15 no cuentan).
    seed.schedule = { ...seed.schedule, startDate: Timestamp.fromDate(new Date(2026, 8, 16)) };
    const { ctx } = setup(seed);
    await waitFor(() => expect(ctx().state.status).toBe("ready"));
    const days = ctx().resolveWeek(1).map((i) => i.date.toDate().getDate());
    expect(days.length).toBeGreaterThan(0);
    expect(Math.min(...days)).toBeGreaterThanOrEqual(16);
  });

  it("markAttendance escribe a través del servicio y descarta el motivo al pasar a 'present'", async () => {
    const { repo, ctx } = setup(buildScheduleSeed());
    await waitFor(() => expect(ctx().state.status).toBe("ready"));
    const [calc] = ctx().resolveWeek(7).filter((i) => i.slotGroupId === "g-calc-mon");

    let result!: Awaited<ReturnType<ScheduleContextValue["markAttendance"]>>;
    await act(async () => {
      result = await ctx().markAttendance({ ...calc, attendance: { ...(calc.attendance ?? ({} as never)), reason: "Cita médica" } as never }, "present");
    });
    expect(result.success).toBe(true);
    expect(repo.calls.upsertAttendance).toBe(1);
    const saved = Array.from(repo.stores.attendance.values()).find(
      (a) => a.slotGroupId === "g-calc-mon" && a.date.toDate().getDate() === 26,
    );
    expect(saved?.status).toBe("present");
    expect(saved?.reason).toBeUndefined();
  });
});
