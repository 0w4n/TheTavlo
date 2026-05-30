// ─── ResultApp ─────────────────────────────

export type ResultApp<T, E> = Ok<T> | Err<E>;

// ─── Ok ───────────────────────────────

interface Ok<T> {
  success: true;
  value: T;
}

export function ok<T>(value: T): Ok<T> {
  return {
    success: true,
    value,
  };
}

// ─── Err ──────────────────────────────────────

export type typeErr =
  | NotFoundErr
  | ValidationErr
  | NetworkErr
  | FirebaseErr
  | AuthErr
  | UnexpectedErr;

interface Err<E> {
  success: false;
  err: E;
}

export function err<E>(error: E): Err<E> {
  return {
    success: false,
    err: error,
  };
}

interface ErrBase {
  message: string;
  number: number;
  stackTrace: string;
}

export interface NotFoundErr extends ErrBase {
  message: "Not Found";
  number: 0;
  stackTrace: "";
}

export interface ValidationErr extends ErrBase {
  message: "Not Found";
  number: 0;
  stackTrace: "";
}

export interface NetworkErr extends ErrBase {
  message: "Not Found";
  number: 0;
  stackTrace: "";
}

export interface FirebaseErr extends ErrBase {
  message: "Not Found";
  number: 0;
  stackTrace: "";
}

export interface AuthErr extends ErrBase {
  message: "Authentication Error";
  number: 401;
  stackTrace: "";
}

export interface UnexpectedErr extends ErrBase {
  message: "Not Found";
  number: 0;
  stackTrace: "";
}

// ─── Type guards ──────────────────────────────────────────────────────

export function isOk<T, E>(result: ResultApp<T, E>): result is Ok<T> {
  return "success" in result === true;
}

export function isErr<T, E>(result: ResultApp<T, E>): result is Err<E> {
  return "success" in result === false;
}
