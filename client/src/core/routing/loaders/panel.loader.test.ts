import { beforeEach, describe, expect, it } from "vitest";
import { createPanelLoader, type PanelLoaderData } from "./panel.loader";
import { PanelsService } from "#features/panels/app/panels.service";
import {
  createFakePanelRepository,
  refTo,
} from "#features/panels/infraestructure/__fixtures__/fakePanelRepository";
import type { Panel } from "#features/panels/domain/panel.entity";
import type { User } from "#core/auth/domain/user.entity";
import type { LoaderFunctionArgs } from "react-router-dom";
import type { Timestamp } from "firebase/firestore";

const now = {} as Timestamp;

function makePanel(id: string, parentId: string | null = null): Panel {
  return {
    id,
    parentId: parentId ? refTo(parentId) : null,
    name: id,
    color: 0,
    icon: "",
    sharedWith: null,
    createdAt: now,
    updatedAt: now,
  };
}

const fakeUser: User = {
  id: "user-1",
  accountType: "users",
  email: "a@b.com",
  displayName: "A",
  photoURL: null,
  createdAt: new Date(),
};

function makeArgs(splat: string | undefined): LoaderFunctionArgs {
  return {
    params: { "*": splat },
    request: new Request(`https://app.test/home/${splat ?? ""}`),
    context: undefined,
  } as unknown as LoaderFunctionArgs;
}

/** Extrae la URL de un redirect() de react-router (es un objeto Response). */
function redirectLocation(thrown: unknown): string | null {
  if (thrown instanceof Response) return thrown.headers.get("Location");
  return null;
}

describe("panelLoader", () => {
  let panels: Panel[];

  beforeEach(() => {
    panels = [
      makePanel("root", null),
      makePanel("child", "root"),
      makePanel("grandchild", "child"),
    ];
  });

  function buildLoader(user: User | null = fakeUser) {
    const fixture = createFakePanelRepository(panels);
    const loader = createPanelLoader({
      getCurrentUser: async () => user,
      createPanelsService: () => new PanelsService(fixture.repository),
    });
    return { loader, ...fixture };
  }

  it("redirige a /login si no hay usuario autenticado", async () => {
    const { loader } = buildLoader(null);

    let thrown: unknown;
    try {
      await loader(makeArgs("root"));
    } catch (e) {
      thrown = e;
    }

    expect(redirectLocation(thrown)).toBe("/login");
  });

  it("redirige a /home?openModal=task-needs-panel para 'home/task' (sin :pid)", async () => {
    const { loader } = buildLoader();

    let thrown: unknown;
    try {
      await loader(makeArgs("task"));
    } catch (e) {
      thrown = e;
    }

    expect(redirectLocation(thrown)).toBe("/home?openModal=task-needs-panel");
  });

  it("redirige a /home?invalidPanel=1 si la cadena de la URL no existe", async () => {
    const { loader } = buildLoader();

    let thrown: unknown;
    try {
      await loader(makeArgs("ghost-panel"));
    } catch (e) {
      thrown = e;
    }

    expect(redirectLocation(thrown)).toBe("/home?invalidPanel=1");
  });

  it("redirige a /home?invalidPanel=1 si la cadena existe pero no está anidada así", async () => {
    // "root/root" -- "root" no puede ser hijo de sí mismo.
    const { loader } = buildLoader();

    let thrown: unknown;
    try {
      await loader(makeArgs("root/root"));
    } catch (e) {
      thrown = e;
    }

    expect(redirectLocation(thrown)).toBe("/home?invalidPanel=1");
  });

  it("resuelve una cadena válida y devuelve kind: 'dashboard'", async () => {
    const { loader } = buildLoader();

    const data = (await loader(makeArgs("root/child"))) as PanelLoaderData;

    expect(data.kind).toBe("dashboard");
    expect(data.panel.id).toBe("child");
    expect(data.panels.map((p) => p.id)).toEqual(["root", "child"]);
  });

  it("resuelve 'task/:tid' del último panel de la cadena como kind: 'task-detail'", async () => {
    const { loader } = buildLoader();

    const data = (await loader(
      makeArgs("root/child/task/abc123"),
    )) as PanelLoaderData;

    expect(data.kind).toBe("task-detail");
    expect(data.panel.id).toBe("child");
    if (data.kind === "task-detail") expect(data.taskId).toBe("abc123");
  });

  it("resuelve 'calendar/:eid' del último panel de la cadena como kind: 'event-detail'", async () => {
    const { loader } = buildLoader();

    const data = (await loader(
      makeArgs("root/child/calendar/evt-1"),
    )) as PanelLoaderData;

    expect(data.kind).toBe("event-detail");
    expect(data.panel.id).toBe("child");
    if (data.kind === "event-detail") expect(data.eventId).toBe("evt-1");
  });

  it("una cadena de 3 niveles resuelve con la caché real en 1 sola lectura por lote, y 0 en la segunda visita", async () => {
    const fixture = createFakePanelRepository(panels);
    const { CachedPanelsRepository } = await import(
      "#features/panels/infraestructure/panelRepository.cached"
    );
    const { getPanelsCacheKey, __resetAllPanelsCacheForTests } = await import(
      "#features/panels/infraestructure/panelsCache"
    );
    __resetAllPanelsCacheForTests();

    const cacheKey = getPanelsCacheKey(fakeUser);
    const loader = createPanelLoader({
      getCurrentUser: async () => fakeUser,
      createPanelsService: () =>
        new PanelsService(new CachedPanelsRepository(fixture.repository, cacheKey)),
    });

    await loader(makeArgs("root/child/grandchild"));
    expect(fixture.calls.findManyByIds).toBe(1);

    await loader(makeArgs("root/child/grandchild"));
    expect(fixture.calls.findManyByIds).toBe(1); // segunda visita: 0 lecturas nuevas
  });
});
