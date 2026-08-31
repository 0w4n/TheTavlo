// ─── ResultApp ─────────────────────────────

export type ResultApp<T, E> = Ok<T> | Err<E>;

// ─── Ok @ Interface + Constructor ─────

interface Ok<T> {
  success: true;
  value: T;
}

export function ok<T>(value: T): Ok<T> {
  return { success: true, value };
}

// ─── Err @ Interface + Constructor ────────────

interface Err<E> {
  success: false;
  err: E;
}

export function err<E>(error: E): Err<E> {
  return { success: false, err: error };
}

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

// ─── AppErr @ Interface + Constructors ───────────────────────────────

export type AppErr =
  | NotFoundErr
  | ValidationErr
  | NetworkErr
  | FirebaseErr
  | AuthErr
  | UnexpectedErr;

  /**
   * Creates a NotFoundErr
   * @example err(notFoundErr("Panel no encontrado"))
   * @param message 
   * @param stackTrace 
   * @returns NotFoundErr
   */
  export function notFoundErr(
    message: string,
    stackTrace?: string,
  ): NotFoundErr {
    return { kind: "NotFound", message, code: 404, stackTrace };
  }

  export function validationErr(
    message: string,
    fields?: Record<string, string>,
    stackTrace?: string,
  ): ValidationErr {
    return { kind: "Validation", message, code: 400, fields, stackTrace };
  }

  export function networkErr(message: string, stackTrace?: string): NetworkErr {
    return { kind: "Network", message, code: 0, stackTrace };
  }

  export function firebaseErr(
    message: string,
    firebaseCode?: string,
    stackTrace?: string,
  ): FirebaseErr {
    return { kind: "Firebase", message, code: 500, firebaseCode, stackTrace };
  }

  export function authErr(message: string, stackTrace?: string): AuthErr {
    return { kind: "Auth", message, code: 401, stackTrace };
  }

  export function unexpectedErr(
    message: string,
    stackTrace?: string,
  ): UnexpectedErr {
    return { kind: "Unexpected", message, code: 500, stackTrace };
  }


// ─── Type guards ──────────────────────────────────────────────────────

export function isOk<T, E>(result: ResultApp<T, E>): result is Ok<T> {
  return result.success === true;
}

export function isErr<T, E>(result: ResultApp<T, E>): result is Err<E> {
  return result.success === false;
}
