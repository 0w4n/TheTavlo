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
const VIEW_KEYWORDS = new Set(["task", "calendar"]);
/**
 * Parsea el splat ("*") que queda después de "/home/" en la URL.
 *
 * @param splat  Ej: "abc/def/task/xyz" para la ruta "/home/abc/def/task/xyz".
 */
export function parsePanelPath(splat) {
    const segments = (splat ?? "").split("/").filter((s) => s.length > 0);
    const keywordIdx = segments.findIndex((s) => VIEW_KEYWORDS.has(s));
    const panelIds = keywordIdx === -1 ? segments : segments.slice(0, keywordIdx);
    const tail = keywordIdx === -1 ? [] : segments.slice(keywordIdx);
    if (panelIds.length === 0) {
        return { ok: false, reason: "no-panel" };
    }
    let view;
    switch (tail.length) {
        case 0:
            view = { type: "dashboard" };
            break;
        case 1:
            if (tail[0] === "task")
                view = { type: "task-list" };
            else if (tail[0] === "calendar")
                view = { type: "calendar" };
            else
                return { ok: false, reason: "malformed" };
            break;
        case 2:
            if (tail[0] === "task")
                view = { type: "task-detail", taskId: tail[1] };
            else if (tail[0] === "calendar")
                view = { type: "event-detail", eventId: tail[1] };
            else
                return { ok: false, reason: "malformed" };
            break;
        default:
            return { ok: false, reason: "malformed" };
    }
    return { ok: true, path: { panelIds, view } };
}
/**
 * Construye la URL de un panel. Es la única función que debería usarse en
 * toda la app para armar rutas de panel (nunca template strings sueltos).
 */
export function buildPanelPath(panelIds, view = { type: "dashboard" }) {
    if (panelIds.length === 0) {
        throw new Error("buildPanelPath requiere al menos un panelId. " +
            "Para 'volver a home' usá '/home' directamente, no esta función.");
    }
    const base = ["/home", ...panelIds].join("/");
    switch (view.type) {
        case "dashboard":
            return base;
        case "task-list":
            return `${base}/task`;
        case "task-detail":
            return `${base}/task/${view.taskId}`;
        case "calendar":
            return `${base}/calendar`;
        case "event-detail":
            return `${base}/calendar/${view.eventId}`;
    }
}
/** Id del panel actualmente "activo" (el último de la cadena, el más anidado). */
export function activePanelId(path) {
    return path.panelIds[path.panelIds.length - 1];
}
