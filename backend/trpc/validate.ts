import { TRPCError } from "@trpc/server";

/**
 * Reemplazo mínimo de zod: no valida esquemas complejos, pero cubre lo que
 * de verdad usan los procedures (strings no vacíos, email, enums cerrados).
 * Cada función tira `BAD_REQUEST` si el valor no cumple — mismo resultado
 * que un `.parse()` de zod fallido, sin la dependencia.
 */

function badInput(message: string): never {
  throw new TRPCError({ code: "BAD_REQUEST", message });
}

export function asObject(value: unknown): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    badInput("Se esperaba un objeto.");
  }
  return value as Record<string, unknown>;
}

export function asString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    badInput(`"${field}" debe ser un texto no vacío.`);
  }
  return value as string;
}

export function asEmail(value: unknown, field = "email"): string {
  const normalized = asString(value, field).trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    badInput(`"${field}" no es un correo válido.`);
  }
  return normalized;
}

export function asOneOf<T extends string>(
  value: unknown,
  options: readonly T[],
  field: string,
): T {
  if (typeof value !== "string" || !(options as readonly string[]).includes(value)) {
    badInput(`"${field}" debe ser uno de: ${options.join(", ")}.`);
  }
  return value as T;
}

export function asOneOfWithDefault<T extends string>(
  value: unknown,
  options: readonly T[],
  field: string,
  fallback: T,
): T {
  if (value === undefined) return fallback;
  return asOneOf(value, options, field);
}
