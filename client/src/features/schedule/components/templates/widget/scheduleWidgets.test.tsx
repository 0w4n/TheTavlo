import { describe, expect, it } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { WidgetComponentProps } from "#features/widgets/domain/widgetDefinition.types";
import { ScheduleService } from "../../../app/schedule.service";
import { createFakeScheduleRepository } from "../../../infrastructure/__fixtures__/fakeScheduleRepository";
import { ScheduleProvider } from "../../../presentation/context/scheduleContext";
import { buildScheduleSeed } from "../../../presentation/__fixtures__/scheduleSeed";
import ScheduleToday from "./ScheduleToday";
import ScheduleNextClass from "./ScheduleNextClass";
import ScheduleAttendance from "./ScheduleAttendance";
import ScheduleWeek from "./ScheduleWeek";

const props = { widgetId: "t", config: {} } as unknown as WidgetComponentProps;
const at = (h: number, m = 0) => () => new Date(2026, 9, 26, h, m);

function mount(ui: React.ReactElement, now = at(11, 20), seed: Parameters<typeof createFakeScheduleRepository>[0] | "empty" = buildScheduleSeed()) {
  const repo = createFakeScheduleRepository(seed === "empty" ? undefined : seed);
  render(
    <ScheduleProvider scheduleService={new ScheduleService(repo.repository)} now={now}>
      {ui}
    </ScheduleProvider>,
  );
  return repo;
}

describe("widgets de Schedule", () => {
  it("Hoy: lista las 4 clases del lunes y marca la que está en curso", async () => {
    mount(<ScheduleToday {...props} />);
    await screen.findByText("Álgebra Lineal");
    expect(screen.getAllByRole("listitem").length).toBeGreaterThanOrEqual(4);
    expect(screen.getByText(/En curso · quedan 1 h 10 min/)).toBeTruthy();
    expect(screen.getAllByText("Se solapa").length).toBe(2);
  });

  it("Hoy: marcar 'Falté' en una clase terminada escribe la asistencia", async () => {
    const repo = mount(<ScheduleToday {...props} />, at(13, 30));
    const group = await screen.findByRole("group", { name: "Asistencia a Cálculo" });
    await userEvent.click(within(group).getByRole("button", { name: "Falté" }));
    await waitFor(() => expect(repo.calls.upsertAttendance).toBe(1));
  });

  it("Hoy: las clases que no han empezado tienen la asistencia deshabilitada", async () => {
    mount(<ScheduleToday {...props} />, at(8, 30));
    const group = await screen.findByRole("group", { name: "Asistencia a Álgebra Lineal" });
    for (const b of within(group).getAllByRole("button")) expect((b as HTMLButtonElement).disabled).toBe(true);
  });

  it("Próxima clase: cuenta atrás hasta la siguiente", async () => {
    mount(<ScheduleNextClass {...props} />, at(8, 30));
    await screen.findByText("En 30 min");
    expect(screen.getByText("Álgebra Lineal")).toBeTruthy();
  });

  it("Asistencia: Cálculo aparece primero con aviso de umbral", async () => {
    mount(<ScheduleAttendance {...props} />);
    await screen.findByText("Asistencia");
    const first = screen.getAllByRole("listitem").find((li) => li.className.includes("sch-subject"))!;
    expect(first.textContent).toContain("Cálculo");
    expect(first.textContent).toContain("Por debajo del 80 %");
  });

  it("Semana: navega a la semana 8 y señala el festivo", async () => {
    mount(<ScheduleWeek {...props} />);
    await screen.findByText("Semana 7");
    await userEvent.click(screen.getByRole("button", { name: "Semana siguiente" }));
    expect(await screen.findByText("Semana 8")).toBeTruthy();
    expect(screen.getByText("Lunes posterior a Todos los Santos")).toBeTruthy();
  });

  it("todos muestran el estado vacío cuando el panel no tiene horario", async () => {
    mount(
      <>
        <ScheduleToday {...props} />
        <ScheduleNextClass {...props} />
        <ScheduleAttendance {...props} />
        <ScheduleWeek {...props} />
      </>,
      at(11, 20),
      "empty",
    );
    await waitFor(() => expect(screen.getAllByText("Este panel no tiene horario")).toHaveLength(4));
  });
});
