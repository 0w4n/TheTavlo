import type { Panel } from "../domain/panel.entity";
import type { AppErr, ResultApp } from "#core/appCore/domain/AppCore.type";
/**
 * Clave de caché estable para un usuario. La ruta real en Firestore es
 * `{accountType}/{userId}/panels/{panelId}` — usamos el mismo par como
 * namespace acá para que el mapeo sea obvio.
 */
export declare function getPanelsCacheKey(user: {
    accountType: string;
    id: string;
}): string;
export declare function getCachedPanel(cacheKey: string, id: string): Panel | undefined;
export declare function setCachedPanel(cacheKey: string, panel: Panel): void;
export declare function setCachedPanels(cacheKey: string, panels: Panel[]): void;
export declare function deleteCachedPanel(cacheKey: string, id: string): void;
export declare function deleteCachedPanels(cacheKey: string, ids: string[]): void;
/** `undefined` = todavía no se pidió nunca; `Panel[]` (posiblemente vacío) = ya está en caché. */
export declare function getCachedChildren(cacheKey: string, parentId: string | null): Panel[] | undefined;
export declare function setCachedChildren(cacheKey: string, parentId: string | null, panels: Panel[]): void;
/**
 * Invalida el registro de hijos de un padre — la próxima vez que se pidan,
 * se vuelve a consultar Firestore. Se usa después de crear/mover/borrar un
 * panel para forzar el redibujado correcto de la UI (ver `cascadeDeletePanel`
 * y `CachedPanelsRepository`).
 */
export declare function invalidateChildren(cacheKey: string, parentId: string | null): void;
/** Limpia toda la caché de un usuario — usar en logout / cambio de cuenta. */
export declare function clearPanelsCache(cacheKey: string): void;
/**
 * Garantiza que todos los `ids` pedidos estén en caché, pidiéndole a la
 * fuente (Firestore, normalmente) ÚNICAMENTE los que falten. Devuelve los
 * paneles en el mismo orden que `ids` (ids inexistentes se omiten del
 * resultado, no rompen la llamada).
 *
 * Es la pieza central de la reducción de lecturas: en una cadena
 * `home/:pid/:pid/:pid` ya visitada, esto resuelve en 0 llamadas a
 * `fetchMissing`.
 */
export declare function ensurePanelsInCache(cacheKey: string, ids: string[], fetchMissing: (missingIds: string[]) => Promise<ResultApp<Panel[], AppErr>>): Promise<ResultApp<Panel[], AppErr>>;
/**
 * Lista los hijos directos de `parentId` bajo demanda. Si ya se pidieron
 * antes en esta sesión, devuelve la caché sin tocar la fuente. Si no,
 * ejecuta `fetchFromSource` una única vez y registra el resultado (incluso
 * si viene vacío) para no repetir la query nunca más para ese padre —hasta
 * que algo la invalide explícitamente (`invalidateChildren`).
 */
export declare function fetchChildrenPanels(cacheKey: string, parentId: string | null, fetchFromSource: () => Promise<ResultApp<Panel[], AppErr>>): Promise<ResultApp<Panel[], AppErr>>;
/** Solo para tests: resetea todo el estado del módulo entre specs. */
export declare function __resetAllPanelsCacheForTests(): void;
