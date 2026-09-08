import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../../trpc/trpc.ts";
import { asObject, asString } from "../../trpc/validate.ts";

interface PanelInput {
  id?: string;
  parentId?: string | null;
  name?: string;
  color?: number;
  icon?: string;
  sharedWith?: string | null;
  isArchived?: boolean;
}

function parsePanelInput(raw: unknown): PanelInput {
  const value = asObject(raw);
  const input: PanelInput = {};

  if (value.id !== undefined) input.id = asString(value.id, "id");
  if (value.parentId !== undefined && value.parentId !== null) {
    input.parentId = asString(value.parentId, "parentId");
  } else if (value.parentId === null) {
    input.parentId = null;
  }
  if (value.name !== undefined) {
    if (typeof value.name !== "string") throw new Error('"name" debe ser un texto.');
    input.name = value.name;
  }
  if (value.color !== undefined) {
    if (typeof value.color !== "number") throw new Error('"color" debe ser un número.');
    input.color = value.color;
  }
  if (value.icon !== undefined) {
    if (typeof value.icon !== "string") throw new Error('"icon" debe ser un texto.');
    input.icon = value.icon;
  }
  if (value.sharedWith !== undefined && value.sharedWith !== null) {
    input.sharedWith = asString(value.sharedWith, "sharedWith");
  } else if (value.sharedWith === null) {
    input.sharedWith = null;
  }
  if (value.isArchived !== undefined) {
    if (typeof value.isArchived !== "boolean") throw new Error('"isArchived" debe ser booleano.');
    input.isArchived = value.isArchived;
  }

  return input;
}

function serializeValue(value: unknown): unknown {
  if (value instanceof Date) return value.toISOString();
  if (value && typeof value === "object" && "toDate" in value && typeof value.toDate === "function") {
    return value.toDate().toISOString();
  }
  if (value && typeof value === "object" && "path" in value && typeof value.path === "string") {
    return value.path;
  }
  if (Array.isArray(value)) return value.map(serializeValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [key, serializeValue(nestedValue)]),
    );
  }
  return value;
}

function parseReference(
  value: string | null | undefined,
  ctx: { user: { uid: string; isAnonymous: boolean }; db: FirebaseFirestore.Firestore },
) {
  if (!value) return null;
  const accountType = ctx.user.isAnonymous ? "guests" : "users";
  return ctx.db.doc(value.includes("/") ? value : `${accountType}/${ctx.user.uid}/panels/${value}`);
}

function panelsCollection(ctx: { user: { uid: string; isAnonymous: boolean }; db: FirebaseFirestore.Firestore }) {
  const accountType = ctx.user.isAnonymous ? "guests" : "users";
  return ctx.db.collection(`${accountType}/${ctx.user.uid}/panels`);
}

const ownerPanelInput = (raw: unknown) => {
  const value = asObject(raw);
  const ownerAccountType = asString(value.ownerAccountType, "ownerAccountType");
  if (ownerAccountType !== "users" && ownerAccountType !== "guests") {
    throw new Error('"ownerAccountType" no es válido.');
  }
  return {
    ownerAccountType,
    ownerId: asString(value.ownerId, "ownerId"),
    panelId: asString(value.panelId, "panelId"),
  } as const;
};

export const panelsRouter = router({
  all: protectedProcedure.query(async ({ ctx }) => {
    const snapshot = await panelsCollection(ctx).get();
    return snapshot.docs.map((document) => serializeValue({ id: document.id, ...document.data() }));
  }),

  byId: protectedProcedure.input((raw) => ({ id: asString(asObject(raw).id, "id") })).query(async ({ ctx, input }) => {
    const document = await panelsCollection(ctx).doc(input.id).get();
    return document.exists ? serializeValue({ id: document.id, ...document.data() }) : null;
  }),

  byOwner: protectedProcedure.input(ownerPanelInput).query(async ({ ctx, input }) => {
    if (ctx.user.uid !== input.ownerId) {
      const index = await ctx.db.doc(`sharedPanelIndex/${ctx.user.uid}/panels/${input.panelId}`).get();
      const status = index.exists ? index.data()?.status : undefined;
      if (!index.exists || !["accepted", "active"].includes(status)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "No tienes acceso a este panel." });
      }
    }
    const document = await ctx.db.doc(`${input.ownerAccountType}/${input.ownerId}/panels/${input.panelId}`).get();
    return document.exists ? serializeValue({ id: document.id, ...document.data() }) : null;
  }),

  role: protectedProcedure.input((raw) => ({ panelId: asString(asObject(raw).panelId, "panelId") })).query(async ({ ctx, input }) => {
    const ownPanel = await ctx.db.doc(`users/${ctx.user.uid}/panels/${input.panelId}`).get();
    if (ownPanel.exists) return "owner" as const;
    const guestPanel = await ctx.db.doc(`guests/${ctx.user.uid}/panels/${input.panelId}`).get();
    if (guestPanel.exists) return "owner" as const;
    const index = await ctx.db.doc(`sharedPanelIndex/${ctx.user.uid}/panels/${input.panelId}`).get();
    return (index.exists ? index.data()?.role : undefined) ?? "unknown";
  }),

  create: protectedProcedure.input(parsePanelInput).mutation(async ({ ctx, input }) => {
    const now = new Date();
    const data = {
      ...input,
      parentId: parseReference(input.parentId, ctx),
      sharedWith: parseReference(input.sharedWith, ctx),
      createdAt: now,
      updatedAt: now,
    };
    const document = await panelsCollection(ctx).add(data);
    return serializeValue({ id: document.id, ...data });
  }),

  update: protectedProcedure.input((raw) => {
    const value = parsePanelInput(raw);
    if (!value.id) throw new Error('"id" es obligatorio.');
    return value;
  }).mutation(async ({ ctx, input }) => {
    const { id, ...changes } = input;
    const panelId = id as string;
    const data = {
      ...changes,
      ...(changes.parentId !== undefined ? { parentId: parseReference(changes.parentId, ctx) } : {}),
      ...(changes.sharedWith !== undefined ? { sharedWith: parseReference(changes.sharedWith, ctx) } : {}),
      updatedAt: new Date(),
    };
    await panelsCollection(ctx).doc(panelId).update(data);
    const document = await panelsCollection(ctx).doc(panelId).get();
    return serializeValue({ id: document.id, ...document.data() });
  }),

  remove: protectedProcedure.input((raw) => ({ id: asString(asObject(raw).id, "id") })).mutation(async ({ ctx, input }) => {
    await panelsCollection(ctx).doc(input.id).delete();
    return { id: input.id };
  }),
});
