// ─── ResultApp ─────────────────────────────
export function ok(value) {
    return { success: true, value };
}
export function err(error) {
    return { success: false, err: error };
}
/**
 * Creates a NotFoundErr
 * @example err(notFoundErr("Panel no encontrado"))
 * @param message
 * @param stackTrace
 * @returns NotFoundErr
 */
export function notFoundErr(message, stackTrace) {
    return { kind: "NotFound", message, code: 404, stackTrace };
}
export function validationErr(message, fields, stackTrace) {
    return { kind: "Validation", message, code: 400, fields, stackTrace };
}
export function networkErr(message, stackTrace) {
    return { kind: "Network", message, code: 0, stackTrace };
}
export function firebaseErr(message, firebaseCode, stackTrace) {
    return { kind: "Firebase", message, code: 500, firebaseCode, stackTrace };
}
export function authErr(message, stackTrace) {
    return { kind: "Auth", message, code: 401, stackTrace };
}
export function unexpectedErr(message, stackTrace) {
    return { kind: "Unexpected", message, code: 500, stackTrace };
}
// ─── Type guards ──────────────────────────────────────────────────────
export function isOk(result) {
    return result.success === true;
}
export function isErr(result) {
    return result.success === false;
}
