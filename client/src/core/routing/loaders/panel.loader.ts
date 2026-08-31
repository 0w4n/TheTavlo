import { redirect, type LoaderFunctionArgs } from "react-router-dom";
import type { Auth } from "firebase/auth";
import { firebaseService } from "#shared/infraestructure/firebase/firebaseConfig";
import { PanelsService } from "#features/panels/app/panels.service";
import { FirebasePanelsRepository } from "#features/panels/infraestructure/panelRepository.firebase";
import { CachedPanelsRepository } from "#features/panels/infraestructure/panelRepository.cached";
import { getPanelsCacheKey } from "#features/panels/infraestructure/panelsCache";
import { isErr } from "#core/appCore/domain/AppCore.type";
import type { Panel } from "#features/panels/domain/panel.entity";
import type { User } from "#core/auth/domain/user.entity";
import { parsePanelPath } from "../panelPath";
import { getCurrentUser } from "./getCurrentUser";

export type PanelLoaderData =
  | { kind: "dashboard"; panels: Panel[]; panel: Panel }
  | { kind: "task-list"; panels: Panel[]; panel: Panel }
  | { kind: "task-detail"; panels: Panel[]; panel: Panel; taskId: string }
  | { kind: "calendar"; panels: Panel[]; panel: Panel }
  | { kind: "event-detail"; panels: Panel[]; panel: Panel; eventId: string };

interface PanelLoaderDeps {
  /** Resuelve el usuario autenticado actual (o null). Inyectable para tests. */
  getCurrentUser: (auth: Auth) => Promise<User | null>;
  /** Arma el servicio de paneles ya envuelto en la caché progresiva para `user`. */
  createPanelsService: (user: User) => PanelsService;
}

function defaultDeps(): PanelLoaderDeps {
  return {
    getCurrentUser,
    createPanelsService: (user) =>
      new PanelsService(
        new CachedPanelsRepository(
          new FirebasePanelsRepository(firebaseService.firestore, () => user),
          getPanelsCacheKey(user),
        ),
      ),
  };
}

/**
 * Fábrica del loader — permite inyectar dependencias fake en tests
 * (`panel.loader.test.ts`) sin necesitar una app de Firebase real ni una
 * sesión de auth real. En producción, `routes.tsx` usa el `panelLoader`
 * exportado por defecto más abajo, que ya viene con las dependencias reales.
 */
export function createPanelLoader(deps: PanelLoaderDeps = defaultDeps()) {
  /**
   * Loader único para toda la cadena `home/:pid[/:pid...][/task[/:tid] |
   * /calendar[/:eid]]`. Reemplaza el switch manual anterior (que además
   * tenía casos "calendar"/"task" que no devolvían nada) por:
   *
   *   1. Parseo puro de la URL (parsePanelPath) — separa la cadena de :pid
   *      de la vista pedida (task/calendar/detalle).
   *   2. Resolución + validación contra la base de datos (resolveChain) —
   *      la URL nunca se confía a ciegas. Internamente usa una caché
   *      progresiva en memoria (`CachedPanelsRepository`), así que
   *      re-visitar una cadena ya conocida no genera lecturas nuevas a
   *      Firestore.
   *
   * Cualquier cadena inválida o inventada a mano (panel inexistente, o que
   * no está anidado donde la URL dice) redirige inmediatamente a `/home` en
   * vez de romper la navegación con una pantalla de error.
   */
  return async function panelLoader({
    params,
  }: LoaderFunctionArgs): Promise<PanelLoaderData> {
    const parsed = parsePanelPath(params["*"]);

    if (!parsed.ok) {
      // "home/task" (o cualquier variante sin :pid) no es una página real.
      // No hay panel al que asociarle las tareas, así que nunca navegamos
      // acá de verdad — esto es solo la red de seguridad para quien
      // escriba la URL a mano. Volvemos a /home con una señal para abrir
      // el modal correcto.
      const modal =
        parsed.reason === "no-panel" ? "task-needs-panel" : "invalid-url";
      throw redirect(`/home?openModal=${modal}`);
    }

    const user = await deps.getCurrentUser(firebaseService.auth);
    if (!user) throw redirect("/login");

    const panelsService = deps.createPanelsService(user);

    console.log("Parsed path:", parsed);

    const homePanel = await panelsService.getHomePanel();

    if (isErr(homePanel)) {
      throw redirect("/home?invalidPanel=1");
    }

    // La cadena de panelIds del parser ya incluye la ruta completa (home/child/grandchild).
    // Si el primer panelId es el homePanel, usamos la cadena tal cual.
    // Si no, preprendemos el homePanel (caso donde la URL es simplemente "task" o similar).
    const panelsIdParsed = parsed.path.panelIds[0] === homePanel.value.id 
      ? parsed.path.panelIds 
      : [homePanel.value.id, ...parsed.path.panelIds];

    const chainResult = await panelsService.resolveChain(panelsIdParsed);

    console.log("Chain result: ", chainResult);
    if (isErr(chainResult)) {
      // Cadena inventada/rota (panel inexistente, o anidado en otro lado):
      // nunca mostramos un error de pantalla completa por esto — es la
      // consecuencia esperable de que alguien edite la URL a mano.
      throw redirect("/home?invalidPanel=1");
    }

    const panels = chainResult.value;
    const panel = panels[panels.length - 1];
    const { view } = parsed.path;

    switch (view.type) {
      case "dashboard":
        return { kind: "dashboard", panels, panel };
      case "task-list":
        return { kind: "task-list", panels, panel };
      case "task-detail":
        return { kind: "task-detail", panels, panel, taskId: view.taskId };
      case "calendar":
        return { kind: "calendar", panels, panel };
      case "event-detail":
        return { kind: "event-detail", panels, panel, eventId: view.eventId };
    }
  };
}

export default createPanelLoader();
