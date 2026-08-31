/**
 * Modela la gramática de rutas anidadas de paneles:
 *
 *   /home/:pid[/:pid...][/task[/:tid] | /calendar[/:eid]]
 *
 * En vez de declarar una ruta estática por cada nivel de anidamiento (que no
 * escala y además hace que React Router pise los `:pid` repetidos), esta
 * gramática se resuelve una sola vez, en un único lugar, con funciones puras
 * y testeables. `parsePanelPath` es la única fuente de verdad para leer una
 * URL; `buildPanelPath` es la única fuente de verdad para construirla — nadie
 * más en la app debería armar un string de ruta de panel a mano.
 */
export type PanelView = {
    type: "dashboard";
} | {
    type: "task-list";
} | {
    type: "task-detail";
    taskId: string;
} | {
    type: "calendar";
} | {
    type: "event-detail";
    eventId: string;
};
export interface PanelPath {
    /** Cadena de ids de panel, en orden, del más externo al más anidado. */
    panelIds: string[];
    view: PanelView;
}
export type ParsePanelPathResult = {
    ok: true;
    path: PanelPath;
} | {
    ok: false;
    /**
     * "no-panel"  → la URL no trae ningún :pid (ej. "home/task" a secas).
     * "malformed" → hay :pid después de "task"/"calendar", o sobran segmentos.
     */
    reason: "no-panel" | "malformed";
};
/**
 * Parsea el splat ("*") que queda después de "/home/" en la URL.
 *
 * @param splat  Ej: "abc/def/task/xyz" para la ruta "/home/abc/def/task/xyz".
 */
export declare function parsePanelPath(splat: string | undefined): ParsePanelPathResult;
/**
 * Construye la URL de un panel. Es la única función que debería usarse en
 * toda la app para armar rutas de panel (nunca template strings sueltos).
 */
export declare function buildPanelPath(panelIds: string[], view?: PanelView): string;
/** Id del panel actualmente "activo" (el último de la cadena, el más anidado). */
export declare function activePanelId(path: PanelPath): string;
