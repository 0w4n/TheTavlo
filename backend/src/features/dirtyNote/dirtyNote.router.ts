import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../../trpc/trpc.ts";
import { asObject, asOneOf, asString } from "../../trpc/validate.ts";

const ACCOUNT_TYPES = ["users", "guests"] as const;
type AccountType = (typeof ACCOUNT_TYPES)[number];

// Debe coincidir con `DIRTY_NOTE_STATUSES` en
// client/src/features/dirtyNote/domain/DirtyNote.entity.ts. Ambos lados lo
// definen aparte porque cliente y backend hoy son proyectos separados (sin
// paquete compartido) — ver la nota sobre `AppRouter` en root.router.ts.
const DIRTY_NOTE_STATUSES = ["sucio", "en progreso", "final"] as const;

const TITLE_MAX_LENGTH = 100;
const CONTENT_MAX_LENGTH = 200_000;

function parseScope(raw: unknown) {
  const value = asObject(raw);
  const ownerAccountType = asString(value.ownerAccountType, "ownerAccountType") as AccountType;
  if (!ACCOUNT_TYPES.includes(ownerAccountType)) throw new Error('"ownerAccountType" no es válido.');
  return { ownerId: asString(value.ownerId, "ownerId"), ownerAccountType, panelId: asString(value.panelId, "panelId") };
}

/**
 * A diferencia del resto de routers de este backend (que reenvían
 * `data` tal cual con `asObject`), aquí SÍ se valida cada campo: `content`
 * es Markdown que se vuelve a renderizar como HTML en el cliente (ver
 * `renderDirtyNoteMarkdown`), así que el servidor no debe dejar pasar campos
 * arbitrarios o de un tipo/tamaño inesperado hacia Firestore.
 */
function parseDirtyNoteData(raw: unknown): Record<string, unknown> {
  const value = asObject(raw);
  const data: Record<string, unknown> = {};

  if (value.title !== undefined) {
    const title = asString(value.title, "title").trim();
    if (title.length === 0) throw new TRPCError({ code: "BAD_REQUEST", message: '"title" no puede estar vacío.' });
    if (title.length > TITLE_MAX_LENGTH) {
      throw new TRPCError({ code: "BAD_REQUEST", message: `"title" no puede exceder ${TITLE_MAX_LENGTH} caracteres.` });
    }
    data.title = title;
  }

  if (value.content !== undefined) {
    if (typeof value.content !== "string") {
      throw new TRPCError({ code: "BAD_REQUEST", message: '"content" debe ser un texto.' });
    }
    if (value.content.length > CONTENT_MAX_LENGTH) {
      throw new TRPCError({ code: "BAD_REQUEST", message: `"content" no puede exceder ${CONTENT_MAX_LENGTH} caracteres.` });
    }
    data.content = value.content;
  }

  if (value.status !== undefined) {
    data.status = asOneOf(value.status, DIRTY_NOTE_STATUSES, "status");
  }

  return data;
}

function parseData(raw: unknown) {
  const value = asObject(raw);
  return { ...parseScope(value), data: parseDirtyNoteData(value.data ?? {}) };
}

function serialize(value: unknown): unknown {
  if (value && typeof value === "object" && "toDate" in value && typeof value.toDate === "function") return value.toDate().toISOString();
  if (Array.isArray(value)) return value.map(serialize);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, serialize(nested)]));
  return value;
}

async function assertAccess(ctx: any, scope: { ownerId: string; panelId: string }, write = false) {
  if (ctx.user.uid === scope.ownerId) return;
  const index = await ctx.db.doc(`sharedPanelIndex/${ctx.user.uid}/panels/${scope.panelId}`).get();
  const data = index.exists ? index.data() : undefined;
  if (!data || !["accepted", "active"].includes(data.status)) throw new TRPCError({ code: "FORBIDDEN", message: "No tienes acceso a este panel." });
  if (write && data.role !== "editor") throw new TRPCError({ code: "FORBIDDEN", message: "Solo el dueño o un editor pueden modificar DirtyNote." });
}

function collection(ctx: any, scope: { ownerAccountType: AccountType; ownerId: string; panelId: string }) {
  return ctx.db.collection(`${scope.ownerAccountType}/${scope.ownerId}/panels/${scope.panelId}/dirtyNote`);
}

export const dirtyNoteRouter = router({
  all: protectedProcedure.input(parseScope).query(async ({ ctx, input }) => {
    await assertAccess(ctx, input);
    const snapshot = await collection(ctx, input).get();
    return snapshot.docs.map((document: any) => serialize({ id: document.id, ...document.data() }));
  }),

  byId: protectedProcedure.input((raw) => {
    const value = asObject(raw);
    return { ...parseScope(value), id: asString(value.id, "id") };
  }).query(async ({ ctx, input }) => {
    await assertAccess(ctx, input);
    const document = await collection(ctx, input).doc(input.id).get();
    return document.exists ? serialize({ id: document.id, ...document.data() }) : null;
  }),

  create: protectedProcedure.input(parseData).mutation(async ({ ctx, input }) => {
    await assertAccess(ctx, input, true);
    if (typeof input.data.title !== "string" || typeof input.data.content !== "string" || typeof input.data.status !== "string") {
      throw new TRPCError({ code: "BAD_REQUEST", message: '"title", "content" y "status" son requeridos para crear una DirtyNote.' });
    }
    const now = new Date();
    const document = await collection(ctx, input).add({ ...input.data, createdAt: now, updatedAt: now });
    return serialize({ id: document.id, ...input.data, createdAt: now, updatedAt: now });
  }),

  update: protectedProcedure.input((raw) => {
    const value = asObject(raw);
    return { ...parseData(value), id: asString(value.id, "id") };
  }).mutation(async ({ ctx, input }) => {
    await assertAccess(ctx, input, true);
    const data = { ...input.data, updatedAt: new Date() };
    await collection(ctx, input).doc(input.id).update(data);
    const document = await collection(ctx, input).doc(input.id).get();
    return serialize({ id: document.id, ...document.data() });
  }),

  remove: protectedProcedure.input((raw) => {
    const value = asObject(raw);
    return { ...parseScope(value), id: asString(value.id, "id") };
  }).mutation(async ({ ctx, input }) => {
    await assertAccess(ctx, input, true);
    await collection(ctx, input).doc(input.id).delete();
  }),
});
