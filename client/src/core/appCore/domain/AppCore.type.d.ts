export type ResultApp<T, E> = Ok<T> | Err<E>;
interface Ok<T> {
    success: true;
    value: T;
}
export declare function ok<T>(value: T): Ok<T>;
interface Err<E> {
    success: false;
    err: E;
}
export declare function err<E>(error: E): Err<E>;
interface ErrBase {
    message: string;
    code: number;
    stackTrace?: string;
}
export interface NotFoundErr extends ErrBase {
    kind: "NotFound";
    code: 404;
}
export interface ValidationErr extends ErrBase {
    kind: "Validation";
    code: 400;
    fields?: Record<string, string>;
}
export interface NetworkErr extends ErrBase {
    kind: "Network";
    code: 0;
}
export interface FirebaseErr extends ErrBase {
    kind: "Firebase";
    code: 500;
    firebaseCode?: string;
}
export interface AuthErr extends ErrBase {
    kind: "Auth";
    code: 401;
}
export interface UnexpectedErr extends ErrBase {
    kind: "Unexpected";
    code: 500;
}
export type AppErr = NotFoundErr | ValidationErr | NetworkErr | FirebaseErr | AuthErr | UnexpectedErr;
/**
 * Creates a NotFoundErr
 * @example err(notFoundErr("Panel no encontrado"))
 * @param message
 * @param stackTrace
 * @returns NotFoundErr
 */
export declare function notFoundErr(message: string, stackTrace?: string): NotFoundErr;
export declare function validationErr(message: string, fields?: Record<string, string>, stackTrace?: string): ValidationErr;
export declare function networkErr(message: string, stackTrace?: string): NetworkErr;
export declare function firebaseErr(message: string, firebaseCode?: string, stackTrace?: string): FirebaseErr;
export declare function authErr(message: string, stackTrace?: string): AuthErr;
export declare function unexpectedErr(message: string, stackTrace?: string): UnexpectedErr;
export declare function isOk<T, E>(result: ResultApp<T, E>): result is Ok<T>;
export declare function isErr<T, E>(result: ResultApp<T, E>): result is Err<E>;
export {};
