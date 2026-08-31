import { type LoaderFunctionArgs } from "react-router-dom";
import type { Auth } from "firebase/auth";
import { PanelsService } from "#features/panels/app/panels.service";
import type { Panel } from "#features/panels/domain/panel.entity";
import type { User } from "#core/auth/domain/user.entity";
export type PanelLoaderData = {
    kind: "dashboard";
    panels: Panel[];
    panel: Panel;
} | {
    kind: "task-list";
    panels: Panel[];
    panel: Panel;
} | {
    kind: "task-detail";
    panels: Panel[];
    panel: Panel;
    taskId: string;
} | {
    kind: "calendar";
    panels: Panel[];
    panel: Panel;
} | {
    kind: "event-detail";
    panels: Panel[];
    panel: Panel;
    eventId: string;
};
interface PanelLoaderDeps {
    /** Resuelve el usuario autenticado actual (o null). Inyectable para tests. */
    getCurrentUser: (auth: Auth) => Promise<User | null>;
    /** Arma el servicio de paneles ya envuelto en la caché progresiva para `user`. */
    createPanelsService: (user: User) => PanelsService;
}
/**
 * Fábrica del loader — permite inyectar dependencias fake en tests
 * (`panel.loader.test.ts`) sin necesitar una app de Firebase real ni una
 * sesión de auth real. En producción, `routes.tsx` usa el `panelLoader`
 * exportado por defecto más abajo, que ya viene con las dependencias reales.
 */
export declare function createPanelLoader(deps?: PanelLoaderDeps): ({ params, }: LoaderFunctionArgs) => Promise<PanelLoaderData>;
declare const _default: ({ params, }: LoaderFunctionArgs) => Promise<PanelLoaderData>;
export default _default;
