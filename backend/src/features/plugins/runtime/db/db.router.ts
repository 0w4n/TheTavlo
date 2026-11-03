import type { CollectionReference, DocumentReference, Query, Transaction, WhereFilterOp } from "firebase-admin/firestore";
import { protectedProcedure, router } from "../../../../trpc/trpc.js";
import {
  asBoolean, asDefault, asEnum, asInt, asObject, asOptional, asString, badRequest,
} from "../../domain/validators.js";
import { INSTANCE_KEYS, pickInstance, type InstanceInput } from "../runtime.inputs.js";
import {
  assertDbAccess, assertDocSize, DB_LIMITS, deepMerge, parseDocumentData, quotaError, withFirestoreErrors, type DbData,
} from "./dbGuards.js";
import { DB_TARGETS, namespaceRoot, readCount, resolveRef, writeCount, type DbTarget } from "./dbNamespace.js";
import { parseDbPath, parseFieldPath, parseOptionalDocPath, SEGMENT_RE, type PathKind } from "./dbPath.js";

/*
 * plugins.runtime.db.* — CRUD de documentos/colecciones para plugins.
 * Ningún procedimiento acepta `pluginId`: `asObject` rechaza claves desconocidas y el
 * pluginId se deriva en servidor del `type` del widget (assertDbAccess).
 */

const WHERE_OPS = ["==", "<", "<=", ">", ">=", "array-contains"] as const;
const RANGE_OPS: readonly string[] = ["<", "<=", ">", ">="];

export type WhereValue = string | number | boolean | null;
export interface DbWhere { field: string; op: (typeof WHERE_OPS)[number]; value: WhereValue }
export interface DbOrderBy { field: string; direction: "asc" | "desc" }

interface Base extends InstanceInput { target: DbTarget; segments: string[] }

function parseBase(raw: unknown, kind: PathKind, extraKeys: readonly string[]): { o: Record<string, unknown>; base: Base } {
  const o = asObject(raw, [...INSTANCE_KEYS, "target", "path", ...extraKeys], "entrada");
  const target = asEnum(o.target, DB_TARGETS, "target");
  return { o, base: { ...pickInstance(o), target, segments: parseDbPath(o.path, kind) } };
}

function parseWhere(raw: unknown): DbWhere {
  const o = asObject(raw, ["field", "op", "value"], "where");
  const op = asEnum(o.op, WHERE_OPS, "where.op");
  const v = o.value;
  const okType = typeof v === "string" ? v.length <= 512 : typeof v === "number" ? Number.isFinite(v) : typeof v === "boolean" || v === null;
  if (!okType || (v === null && op !== "==")) badRequest('"where.value" no es válido.');
  return { field: parseFieldPath(o.field, "where.field"), op, value: v as WhereValue };
}

function parseOrderBy(raw: unknown): DbOrderBy {
  const o = asObject(raw, ["field", "direction"], "orderBy");
  return {
    field: parseFieldPath(o.field, "orderBy.field"),
    direction: asDefault<"asc" | "desc">(o.direction, "asc", (d) => asEnum(d, ["asc", "desc"] as const, "orderBy.direction")),
  };
}

export const parseGetInput = (raw: unknown) => parseBase(raw, "doc", []).base;
export const parseDeleteInput = parseGetInput;
export const parseDeleteCollectionInput = (raw: unknown) => parseBase(raw, "collection", []).base;
export const parseCreateInput = (raw: unknown) => {
  const { o, base } = parseBase(raw, "collection", ["data"]);
  return { ...base, data: parseDocumentData(o.data) };
};
export const parseSetInput = (raw: unknown) => {
  const { o, base } = parseBase(raw, "doc", ["data", "merge"]);
  return { ...base, data: parseDocumentData(o.data), merge: asDefault(o.merge, false, (v) => asBoolean(v, "merge")) };
};
export const parseUpdateInput = (raw: unknown) => {
  const { o, base } = parseBase(raw, "doc", ["data"]);
  return { ...base, data: parseDocumentData(o.data) };
};

export const parseListQueryInput = (raw: unknown) => {
  const { o, base } = parseBase(raw, "collection", ["limit", "startAfter", "where", "orderBy"]);
  const where = asOptional(o.where, parseWhere);
  const orderBy = asOptional(o.orderBy, parseOrderBy);
  // Sin índices compuestos: orden solo con filtro de RANGO sobre el mismo campo, o sin filtro (índice simple).
  if (where && orderBy && (orderBy.field !== where.field || !RANGE_OPS.includes(where.op))) {
    badRequest("orderBy solo puede usarse sobre el campo del filtro de rango.");
  }
  return {
    ...base, where, orderBy,
    limit: asDefault(o.limit, 25, (v) => asInt(v, "limit", { min: 1, max: DB_LIMITS.maxListLimit })),
    startAfter: asOptional(o.startAfter, (v) => asString(v, "startAfter", { max: 64, regex: SEGMENT_RE })),
  };
};

export const parseCollectionsInput = (raw: unknown) => {
  const o = asObject(raw, [...INSTANCE_KEYS, "target", "path"], "entrada");
  return { ...pickInstance(o), target: asEnum(o.target, DB_TARGETS, "target"), segments: parseOptionalDocPath(o.path) };
};

const relPath = (segments: string[], id?: string) => (id ? [...segments, id] : segments).join("/");

/** Raíz del namespace + referencia resuelta, tras los controles de acceso. */
async function open<R extends CollectionReference | DocumentReference>(
  ctx: any, input: Base, permission: "db.read" | "db.write",
): Promise<{ root: DocumentReference; ref: R }> {
  const { pluginId } = await assertDbAccess(ctx, input, permission);
  const root = namespaceRoot(ctx, input, input.target, pluginId);
  return { root, ref: resolveRef(root, input.segments) as R };
}

export const dbRouter = router({
  get: protectedProcedure.input(parseGetInput).query(({ ctx, input }) => withFirestoreErrors(async () => {
    const { ref } = await open<DocumentReference>(ctx, input, "db.read");
    const snap = await ref.get();
    return snap.exists ? { id: snap.id, path: relPath(input.segments), data: snap.data() as DbData } : null;
  })),

  list: protectedProcedure.input(parseListQueryInput).query(({ ctx, input }) => withFirestoreErrors(async () => {
    const { ref: col } = await open<CollectionReference>(ctx, input, "db.read");
    let query: Query = col;
    if (input.where) query = query.where(input.where.field, input.where.op as WhereFilterOp, input.where.value);
    if (input.orderBy) query = query.orderBy(input.orderBy.field, input.orderBy.direction);
    if (input.startAfter) {
      const cursor = await col.doc(input.startAfter).get();
      if (!cursor.exists) badRequest('"startAfter" no existe.');
      query = query.startAfter(cursor);
    }
    const snap = await query.limit(input.limit + 1).get(); // +1 para saber si hay más sin una página vacía
    const page = snap.docs.slice(0, input.limit);
    return {
      docs: page.map((d) => ({ id: d.id, path: relPath(input.segments, d.id), data: d.data() as DbData })),
      nextCursor: snap.docs.length > input.limit ? page[page.length - 1]!.id : null,
    };
  })),

  collections: protectedProcedure.input(parseCollectionsInput).query(({ ctx, input }) => withFirestoreErrors(async () => {
    const { pluginId } = await assertDbAccess(ctx, input, "db.read");
    const root = namespaceRoot(ctx, input, input.target, pluginId);
    const parent = resolveRef(root, input.segments) as DocumentReference;
    return { collections: (await parent.listCollections()).map((c) => c.id).sort() };
  })),

  create: protectedProcedure.input(parseCreateInput).mutation(({ ctx, input }) => withFirestoreErrors(async () => {
    assertDocSize(input.data);
    const { root, ref: col } = await open<CollectionReference>(ctx, input, "db.write");
    const ref = col.doc(); // id autogenerado
    await ctx.db.runTransaction(async (tx: Transaction) => {
      const count = await readCount(tx, root);
      if (count >= DB_LIMITS.maxDocsPerNamespace) throw quotaError();
      tx.create(ref, input.data);
      writeCount(tx, root, count + 1);
    });
    return { id: ref.id, path: relPath(input.segments, ref.id) };
  })),

  set: protectedProcedure.input(parseSetInput).mutation(({ ctx, input }) => withFirestoreErrors(async () => {
    assertDocSize(input.data);
    const { root, ref } = await open<DocumentReference>(ctx, input, "db.write");
    await ctx.db.runTransaction(async (tx: Transaction) => {
      const [snap, count] = await Promise.all([tx.get(ref), readCount(tx, root)]);
      let next: DbData = input.data;
      if (!snap.exists) {
        if (count >= DB_LIMITS.maxDocsPerNamespace) throw quotaError();
        writeCount(tx, root, count + 1);
      } else if (input.merge) {
        next = deepMerge(snap.data() as DbData, input.data);
        assertDocSize(next); // el resultado de la fusión también ≤ 32 KB
      }
      tx.set(ref, next);
    });
    return { id: ref.id, path: relPath(input.segments) };
  })),

  update: protectedProcedure.input(parseUpdateInput).mutation(({ ctx, input }) => withFirestoreErrors(async () => {
    assertDocSize(input.data);
    const { ref } = await open<DocumentReference>(ctx, input, "db.write");
    await ctx.db.runTransaction(async (tx: Transaction) => {
      const snap = await tx.get(ref);
      if (!snap.exists) throw Object.assign(new Error("not-found"), { code: 5 });
      const next: DbData = { ...(snap.data() as DbData), ...input.data }; // campos de primer nivel reemplazados
      assertDocSize(next);
      tx.set(ref, next);
    });
    return { id: ref.id, path: relPath(input.segments) };
  })),

  delete: protectedProcedure.input(parseDeleteInput).mutation(({ ctx, input }) => withFirestoreErrors(async () => {
    const { root, ref } = await open<DocumentReference>(ctx, input, "db.write");
    return ctx.db.runTransaction(async (tx: Transaction) => {
      const [snap, count] = await Promise.all([tx.get(ref), readCount(tx, root)]);
      if (!snap.exists) return { deleted: false };
      tx.delete(ref);
      writeCount(tx, root, count - 1);
      return { deleted: true };
    });
  })),

  /** NO recursivo: borra solo documentos directos (hasta 499 por llamada); repetir mientras `hasMore`. */
  deleteCollection: protectedProcedure.input(parseDeleteCollectionInput).mutation(({ ctx, input }) => withFirestoreErrors(async () => {
    const { root, ref: col } = await open<CollectionReference>(ctx, input, "db.write");
    return ctx.db.runTransaction(async (tx: Transaction) => {
      const [snap, count] = await Promise.all([tx.get(col.limit(DB_LIMITS.maxDeletePerCall + 1)), readCount(tx, root)]);
      const batch = snap.docs.slice(0, DB_LIMITS.maxDeletePerCall);
      batch.forEach((d) => tx.delete(d.ref));
      if (batch.length > 0) writeCount(tx, root, count - batch.length);
      return { deleted: batch.length, hasMore: snap.docs.length > DB_LIMITS.maxDeletePerCall };
    });
  })),
});
