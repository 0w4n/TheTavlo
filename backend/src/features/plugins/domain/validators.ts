import { TRPCError } from "@trpc/server";

/**
 * Validadores mínimos y puros de la feature de plugins (sin dependencias).
 * Mismos nombres y semántica que `src/trpc/validate.ts` (`asObject`, `asString`
 * son compatibles hacia atrás: los parámetros extra son opcionales) para poder
 * sustituirlos por los reales. Equivalencia: `asEnum` ≙ `asOneOf` (mismo orden
 * de argumentos). Ningún mensaje repite el valor recibido.
 */

export function badRequest(message: string): never {
  throw new TRPCError({ code: "BAD_REQUEST", message });
}

/** Objeto plano. Con `allowedKeys` rechaza cualquier clave desconocida (equivale a `.strict()`). */
export function asObject(value: unknown, allowedKeys?: readonly string[], field = "entrada"): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    badRequest(`"${field}" debe ser un objeto.`);
  }
  const obj = value as Record<string, unknown>;
  if (allowedKeys) {
    for (const key of Object.keys(obj)) {
      if (!allowedKeys.includes(key)) badRequest(`"${field}" contiene claves no permitidas.`);
    }
  }
  return obj;
}

export interface StringOptions {
  min?: number; // por defecto 1 (no vacío; con min ≥ 1 tampoco vale solo espacios)
  max?: number;
  regex?: RegExp;
}

export function asString(value: unknown, field: string, { min = 1, max, regex }: StringOptions = {}): string {
  if (typeof value !== "string") badRequest(`"${field}" debe ser un texto.`);
  const text = value as string;
  if (text.length < min || (min >= 1 && text.trim().length === 0)) badRequest(`"${field}" es demasiado corto.`);
  if (max !== undefined && text.length > max) badRequest(`"${field}" supera ${max} caracteres.`);
  if (regex && !regex.test(text)) badRequest(`"${field}" tiene un formato no válido.`);
  return text;
}

export function asInt(value: unknown, field: string, { min, max }: { min?: number; max?: number } = {}): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value)) badRequest(`"${field}" debe ser un entero.`);
  const n = value as number;
  if ((min !== undefined && n < min) || (max !== undefined && n > max)) badRequest(`"${field}" está fuera de rango.`);
  return n;
}

export function asBoolean(value: unknown, field: string): boolean {
  if (typeof value !== "boolean") badRequest(`"${field}" debe ser booleano.`);
  return value as boolean;
}

export function asEnum<T extends string>(value: unknown, options: readonly T[], field: string): T {
  if (typeof value !== "string" || !(options as readonly string[]).includes(value)) {
    badRequest(`"${field}" debe ser uno de: ${options.join(", ")}.`);
  }
  return value as T;
}

export function asArray<T>(
  value: unknown, field: string, parseItem: (item: unknown, index: number) => T,
  { min = 0, max }: { min?: number; max?: number } = {},
): T[] {
  if (!Array.isArray(value)) badRequest(`"${field}" debe ser una lista.`);
  const list = value as unknown[];
  if (list.length < min || (max !== undefined && list.length > max)) badRequest(`"${field}" tiene un tamaño no válido.`);
  return list.map(parseItem);
}

/** `{ [clave]: valor }`. `Object.fromEntries` crea propiedades propias (a salvo de `__proto__`). */
export function asRecord<T>(
  value: unknown, field: string, parseValue: (item: unknown, key: string) => T,
  { maxKeys = 100, keyMin = 1, keyMax = 64 }: { maxKeys?: number; keyMin?: number; keyMax?: number } = {},
): Record<string, T> {
  const obj = asObject(value, undefined, field);
  const keys = Object.keys(obj);
  if (keys.length > maxKeys) badRequest(`"${field}" tiene demasiadas claves.`);
  for (const key of keys) {
    if (key.length < keyMin || key.length > keyMax) badRequest(`"${field}" tiene una clave con longitud no válida.`);
  }
  return Object.fromEntries(keys.map((key) => [key, parseValue(obj[key], key)]));
}

export function asOptional<T>(value: unknown, parse: (v: unknown) => T): T | undefined {
  return value === undefined ? undefined : parse(value);
}

export function asDefault<T>(value: unknown, fallback: T, parse: (v: unknown) => T): T {
  return value === undefined ? fallback : parse(value);
}
