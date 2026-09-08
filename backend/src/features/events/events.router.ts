import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../../trpc/trpc.ts";
import { asObject, asString } from "../../trpc/validate.ts";

const ACCOUNT_TYPES = ["users", "guests"] as const;
type AccountType = (typeof ACCOUNT_TYPES)[number];

function parseScope(raw: unknown) {
  const value = asObject(raw);
  const ownerAccountType = asString(value.ownerAccountType, "ownerAccountType") as AccountType;
  if (!ACCOUNT_TYPES.includes(ownerAccountType)) throw new Error('"ownerAccountType" no es válido.');
  return {
    ownerId: asString(value.ownerId, "ownerId"),
    ownerAccountType,
    panelId: asString(value.panelId, "panelId"),
  };
}

function parseWithData(raw: unknown) {
  const value = asObject(raw);
  return { ...parseScope(value), data: asObject(value.data ?? {}) };
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
  if (write && data.role !== "editor") throw new TRPCError({ code: "FORBIDDEN", message: "Solo el dueño o un editor pueden modificar eventos." });
}

function collection(ctx: any, scope: { ownerAccountType: AccountType; ownerId: string; panelId: string }) {
  return ctx.db.collection(`${scope.ownerAccountType}/${scope.ownerId}/panels/${scope.panelId}/event`);
}

export const eventsRouter = router({
  all: protectedProcedure.input(parseScope).query(async ({ ctx, input }) => {
    await assertAccess(ctx, input);
    const snapshot = await collection(ctx, input).where("type", "==", "exam").get();
    const now = new Date();
    return snapshot.docs
      .filter((document: any) => {
        const makeAt = document.data().makeAt;
        return makeAt?.toDate ? makeAt.toDate() > now : false;
      })
      .map((document: any) => serialize({ id: document.id, ...document.data() }));
  }),

  byId: protectedProcedure.input((raw) => {
    const value = asObject(raw);
    return { ...parseScope(value), id: asString(value.id, "id") };
  }).query(async ({ ctx, input }) => {
    await assertAccess(ctx, input);
    const document = await collection(ctx, input).doc(input.id).get();
    return document.exists ? serialize({ id: document.id, ...document.data() }) : null;
  }),

  create: protectedProcedure.input(parseWithData).mutation(async ({ ctx, input }) => {
    await assertAccess(ctx, input, true);
    const now = new Date();
    const data = { ...input.data, createdAt: now, updatedAt: now };
    const document = await collection(ctx, input).add(data);
    return serialize({ id: document.id, ...data });
  }),

  update: protectedProcedure.input((raw) => {
    const value = asObject(raw);
    return { ...parseWithData(value), id: asString(value.id, "id") };
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
