import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../../trpc/trpc.ts";
import { asObject, asString } from "../../trpc/validate.ts";

const ACCOUNT_TYPES = ["users", "guests"] as const;
type AccountType = (typeof ACCOUNT_TYPES)[number];

interface WidgetScope {
  ownerId: string;
  ownerAccountType: AccountType;
  panelId: string;
}

function parseScope(raw: unknown): WidgetScope {
  const value = asObject(raw);
  const ownerAccountType = asString(value.ownerAccountType, "ownerAccountType") as AccountType;
  if (!ACCOUNT_TYPES.includes(ownerAccountType)) throw new Error('"ownerAccountType" no es válido.');
  return {
    ownerId: asString(value.ownerId, "ownerId"),
    ownerAccountType,
    panelId: asString(value.panelId, "panelId"),
  };
}

function parseWidgetInput(raw: unknown) {
  const value = asObject(raw);
  const scope = parseScope(value);
  const data = asObject(value.data ?? {});
  return { ...scope, data };
}

function serialize(value: unknown): unknown {
  if (value && typeof value === "object" && "toDate" in value && typeof value.toDate === "function") {
    return value.toDate().toISOString();
  }
  if (Array.isArray(value)) return value.map(serialize);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, serialize(nested)]));
  }
  return value;
}

async function assertReadable(ctx: any, scope: WidgetScope, write = false): Promise<void> {
  if (ctx.user.uid === scope.ownerId) return;
  const index = await ctx.db.doc(`sharedPanelIndex/${ctx.user.uid}/panels/${scope.panelId}`).get();
  const role = index.exists ? index.data()?.role : undefined;
  const status = index.exists ? index.data()?.status : undefined;
  if (!index.exists || (status !== "accepted" && status !== "active")) {
    throw new TRPCError({ code: "FORBIDDEN", message: "No tienes acceso a este panel." });
  }
  if (write && role !== "editor") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Solo el dueño o un editor pueden modificar widgets." });
  }
}

function widgetsCollection(ctx: any, scope: WidgetScope) {
  return ctx.db.collection(`${scope.ownerAccountType}/${scope.ownerId}/panels/${scope.panelId}/widgets`);
}

export const widgetsRouter = router({
  all: protectedProcedure.input(parseScope).query(async ({ ctx, input }) => {
    await assertReadable(ctx, input);
    const snapshot = await widgetsCollection(ctx, input).get();
    return snapshot.docs.map((document: FirebaseFirestore.QueryDocumentSnapshot) => serialize({ id: document.id, ...document.data() }));
  }),

  byId: protectedProcedure.input((raw) => {
    const value = asObject(raw);
    return { ...parseScope(value), id: asString(value.id, "id") };
  }).query(async ({ ctx, input }) => {
    await assertReadable(ctx, input);
    const document = await widgetsCollection(ctx, input).doc(input.id).get();
    return document.exists ? serialize({ id: document.id, ...document.data() }) : null;
  }),

  create: protectedProcedure.input(parseWidgetInput).mutation(async ({ ctx, input }) => {
    await assertReadable(ctx, input, true);
    const now = new Date();
    const data = { ...input.data, createdAt: now, updatedAt: now };
    const document = await widgetsCollection(ctx, input).add(data);
    return serialize({ id: document.id, ...data });
  }),

  update: protectedProcedure.input((raw) => {
    const value = asObject(raw);
    return { ...parseWidgetInput(value), id: asString(value.id, "id") };
  }).mutation(async ({ ctx, input }) => {
    await assertReadable(ctx, input, true);
    const data = { ...input.data, updatedAt: new Date() };
    await widgetsCollection(ctx, input).doc(input.id).update(data);
    const document = await widgetsCollection(ctx, input).doc(input.id).get();
    return serialize({ id: document.id, ...document.data() });
  }),

  remove: protectedProcedure.input((raw) => {
    const value = asObject(raw);
    return { ...parseScope(value), id: asString(value.id, "id") };
  }).mutation(async ({ ctx, input }) => {
    await assertReadable(ctx, input, true);
    await widgetsCollection(ctx, input).doc(input.id).delete();
    return { id: input.id };
  }),
});
