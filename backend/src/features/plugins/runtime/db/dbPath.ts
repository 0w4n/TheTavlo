import { asString, badRequest } from "../../domain/validators.js";

/** Segmento de path (id de colección/documento): sin `.`/`..`, sin `/`. */
export const SEGMENT_RE = /^[A-Za-z0-9_-]{1,64}$/;
/** Segmentos que Firestore reserva (`__x__`). */
const RESERVED_RE = /^__.*__$/;
export const MAX_PATH_SEGMENTS = 4;
const MAX_PATH_CHARS = MAX_PATH_SEGMENTS * 65;

export type PathKind = "doc" | "collection";

/**
 * "col/doc/col/…" → segmentos validados. Colección ⇒ nº impar, documento ⇒ nº par.
 * Con 4 segmentos máx.: colecciones a 1 o 3, documentos a 2 o 4.
 */
export function parseDbPath(raw: unknown, kind: PathKind, field = "path"): string[] {
  const path = asString(raw, field, { max: MAX_PATH_CHARS });
  const segments = path.split("/");
  if (segments.length > MAX_PATH_SEGMENTS) badRequest(`"${field}" supera ${MAX_PATH_SEGMENTS} segmentos.`);
  for (const seg of segments) {
    if (!SEGMENT_RE.test(seg) || RESERVED_RE.test(seg)) badRequest(`"${field}" contiene un segmento no válido.`);
  }
  const isDoc = segments.length % 2 === 0;
  if ((kind === "doc") !== isDoc) {
    badRequest(kind === "doc" ? `"${field}" debe apuntar a un documento (nº par de segmentos).` : `"${field}" debe apuntar a una colección (nº impar de segmentos).`);
  }
  return segments;
}

/** Para `collections`: ausente o "" = raíz del namespace; si no, un documento. */
export function parseOptionalDocPath(raw: unknown): string[] {
  return raw === undefined || raw === "" ? [] : parseDbPath(raw, "doc");
}

/** Campo de `where`/`orderBy`: "a" o "a.b" (hasta 8 niveles), sin prefijo `__`. */
export function parseFieldPath(raw: unknown, field: string): string {
  const path = asString(raw, field, { max: 8 * 65 });
  const parts = path.split(".");
  if (parts.length > 8 || parts.some((p) => !SEGMENT_RE.test(p) || p.startsWith("__"))) {
    badRequest(`"${field}" no es un campo válido.`);
  }
  return path;
}
