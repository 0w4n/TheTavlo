import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../../trpc/trpc.ts";
import { asObject, asString } from "../../trpc/validate.ts";

const ACCOUNT_TYPES = ["users", "guests"] as const;
type AccountType = (typeof ACCOUNT_TYPES)[number];

function parseScope(raw: unknown) {
  const value = asObject(raw);
  const ownerAccountType = asString(value.ownerAccountType, "ownerAccountType") as AccountType;
  if (!ACCOUNT_TYPES.includes(ownerAccountType)) throw new Error('"ownerAccountType" no es válido.');
  return { ownerId: asString(value.ownerId, "ownerId"), ownerAccountType, panelId: asString(value.panelId, "panelId") };
}
function parseBookScope(raw: unknown) {
  const value = asObject(raw);
  return { ...parseScope(value), cookingBookId: asString(value.cookingBookId, "cookingBookId") };
}
function parseData(raw: unknown) {
  const value = asObject(raw);
  return { ...parseScope(value), data: asObject(value.data ?? {}) };
}
function parseRecipeData(raw: unknown) {
  const value = asObject(raw);
  return { ...parseBookScope(value), data: asObject(value.data ?? {}) };
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
  if (write && data.role !== "editor") throw new TRPCError({ code: "FORBIDDEN", message: "Solo el dueño o un editor pueden modificar el recetario." });
}
function books(ctx: any, scope: { ownerAccountType: AccountType; ownerId: string; panelId: string }) {
  return ctx.db.collection(`${scope.ownerAccountType}/${scope.ownerId}/panels/${scope.panelId}/cookingBook`);
}
function recipes(ctx: any, input: { ownerAccountType: AccountType; ownerId: string; panelId: string; cookingBookId: string }) {
  return books(ctx, input).doc(input.cookingBookId).collection("cookingRecipe");
}

export const cookingBookRouter = router({
  books: protectedProcedure.input(parseScope).query(async ({ ctx, input }) => {
    await assertAccess(ctx, input);
    const snapshot = await books(ctx, input).get();
    return snapshot.docs.map((document: any) => serialize({ id: document.id, ...document.data() }));
  }),
  book: protectedProcedure.input((raw) => ({ ...parseScope(raw), id: asString(asObject(raw).id, "id") })).query(async ({ ctx, input }) => {
    await assertAccess(ctx, input);
    const document = await books(ctx, input).doc(input.id).get();
    return document.exists ? serialize({ id: document.id, ...document.data() }) : null;
  }),
  createBook: protectedProcedure.input(parseData).mutation(async ({ ctx, input }) => {
    await assertAccess(ctx, input, true);
    const now = new Date();
    const document = books(ctx, input).doc();
    const data = { ...input.data, createdAt: now, updatedAt: now };
    await document.set(data);
    return serialize({ id: document.id, ...data });
  }),
  updateBook: protectedProcedure.input((raw) => ({ ...parseData(raw), id: asString(asObject(raw).id, "id") })).mutation(async ({ ctx, input }) => {
    await assertAccess(ctx, input, true);
    await books(ctx, input).doc(input.id).update({ ...input.data, updatedAt: new Date() });
    const document = await books(ctx, input).doc(input.id).get();
    return serialize({ id: document.id, ...document.data() });
  }),
  removeBook: protectedProcedure.input((raw) => ({ ...parseScope(raw), id: asString(asObject(raw).id, "id") })).mutation(async ({ ctx, input }) => {
    await assertAccess(ctx, input, true);
    await books(ctx, input).doc(input.id).delete();
  }),
  recipes: protectedProcedure.input(parseBookScope).query(async ({ ctx, input }) => {
    await assertAccess(ctx, input);
    const snapshot = await recipes(ctx, input).get();
    return snapshot.docs.map((document: any) => serialize({ id: document.id, ...document.data() }));
  }),
  recipe: protectedProcedure.input((raw) => ({ ...parseBookScope(raw), id: asString(asObject(raw).id, "id") })).query(async ({ ctx, input }) => {
    await assertAccess(ctx, input);
    const document = await recipes(ctx, input).doc(input.id).get();
    return document.exists ? serialize({ id: document.id, ...document.data() }) : null;
  }),
  createRecipe: protectedProcedure.input(parseRecipeData).mutation(async ({ ctx, input }) => {
    await assertAccess(ctx, input, true);
    const now = new Date();
    const document = recipes(ctx, input).doc();
    const data = { ...input.data, createdAt: now, updatedAt: now };
    await document.set(data);
    return serialize({ id: document.id, ...data });
  }),
  updateRecipe: protectedProcedure.input((raw) => ({ ...parseRecipeData(raw), id: asString(asObject(raw).id, "id") })).mutation(async ({ ctx, input }) => {
    await assertAccess(ctx, input, true);
    await recipes(ctx, input).doc(input.id).update({ ...input.data, updatedAt: new Date() });
    const document = await recipes(ctx, input).doc(input.id).get();
    return serialize({ id: document.id, ...document.data() });
  }),
  removeRecipe: protectedProcedure.input((raw) => ({ ...parseBookScope(raw), id: asString(asObject(raw).id, "id") })).mutation(async ({ ctx, input }) => {
    await assertAccess(ctx, input, true);
    await recipes(ctx, input).doc(input.id).delete();
  }),
});
