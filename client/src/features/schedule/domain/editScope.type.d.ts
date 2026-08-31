/**
 * El alcance temporal elegido por el usuario en `EditScopeDialog` (diseño
 * §7.3) al editar o eliminar una clase recurrente. Determina qué mecanismo
 * usa el algoritmo de versionado (diseño §14-15):
 *
 * - "today" / "thisWeek"  -> crea una `OccurrenceException` puntual.
 * - "fromNow" / "forever" -> cierra la versión activa y abre una nueva sin
 *                            fecha de fin (mismo mecanismo para ambas).
 * - "weekRange"           -> cierra la versión activa, abre una nueva
 *                            vigente solo para el rango, y una tercera de
 *                            "continuación" que retoma el contenido previo
 *                            después del rango (ver EC-10).
 */
export type EditScope = {
    kind: "today";
} | {
    kind: "thisWeek";
} | {
    kind: "fromNow";
} | {
    kind: "forever";
} | {
    kind: "weekRange";
    fromWeek: number;
    toWeek: number;
};
export declare function isSingleOccurrenceScope(scope: EditScope): scope is {
    kind: "today";
} | {
    kind: "thisWeek";
};
export declare function isRecurrenceScope(scope: EditScope): scope is {
    kind: "fromNow";
} | {
    kind: "forever";
} | {
    kind: "weekRange";
    fromWeek: number;
    toWeek: number;
};
