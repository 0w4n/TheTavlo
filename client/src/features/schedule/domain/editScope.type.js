export function isSingleOccurrenceScope(scope) {
    return scope.kind === "today" || scope.kind === "thisWeek";
}
export function isRecurrenceScope(scope) {
    return !isSingleOccurrenceScope(scope);
}
