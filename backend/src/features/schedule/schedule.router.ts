import { FieldValue } from "firebase-admin/firestore";
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

function parseScheduleScope(raw: unknown) {
  const value = asObject(raw);
  return { ...parseScope(value), scheduleId: asString(value.scheduleId, "scheduleId") };
}

function parseData(raw: unknown) {
  const value = asObject(raw);
  return { ...parseScheduleScope(value), data: asObject(value.data ?? {}) };
}

function serialize(value: unknown): unknown {
  if (value && typeof value === "object" && "path" in value && typeof value.path === "string") return value.path;
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
  if (write && data.role !== "editor") throw new TRPCError({ code: "FORBIDDEN", message: "Solo el dueño o un editor pueden modificar el horario." });
}

function scheduleCollection(ctx: any, scope: { ownerAccountType: AccountType; ownerId: string; panelId: string }) {
  return ctx.db.collection(`${scope.ownerAccountType}/${scope.ownerId}/panels/${scope.panelId}/schedule`);
}

function childCollection(ctx: any, input: { ownerAccountType: AccountType; ownerId: string; panelId: string; scheduleId: string }, child: string) {
  return scheduleCollection(ctx, input).doc(input.scheduleId).collection(child);
}

export const scheduleRouter = router({
  snapshot: protectedProcedure.input(parseScope).query(async ({ ctx, input }) => {
    await assertAccess(ctx, input);
    const schedules = await scheduleCollection(ctx, input).get();
    if (schedules.empty) return null;
    const schedule = schedules.docs[0]!;
    const [subjects, slots, exceptions, attendance] = await Promise.all([
      schedule.ref.collection("subjects").get(),
      schedule.ref.collection("slotVersions").get(),
      schedule.ref.collection("exceptions").get(),
      schedule.ref.collection("attendance").get(),
    ]);
    return serialize({
      schedule: { id: schedule.id, ...schedule.data() },
      subjects: subjects.docs.map((document: any) => ({ id: document.id, ...document.data() })),
      slots: slots.docs.map((document: any) => ({ id: document.id, ...document.data() })),
      exceptions: exceptions.docs.map((document: any) => ({ id: document.id, ...document.data() })),
      attendance: attendance.docs.map((document: any) => ({ id: document.id, ...document.data() })),
    });
  }),

  create: protectedProcedure.input((raw) => {
    const value = asObject(raw);
    return { ...parseScope(value), data: asObject(value.data ?? {}) };
  }).mutation(async ({ ctx, input }) => {
    await assertAccess(ctx, input, true);
    const existing = await scheduleCollection(ctx, input).limit(1).get();
    if (!existing.empty) throw new TRPCError({ code: "BAD_REQUEST", message: "Este panel ya tiene un horario asociado." });
    const now = new Date();
    const document = scheduleCollection(ctx, input).doc();
    const data = { ...input.data, createdAt: now, updatedAt: now };
    await document.set(data);
    return serialize({ id: document.id, ...data });
  }),

  update: protectedProcedure.input(parseData).mutation(async ({ ctx, input }) => {
    await assertAccess(ctx, input, true);
    await scheduleCollection(ctx, input).doc(input.scheduleId).update({ ...input.data, updatedAt: new Date() });
    const document = await scheduleCollection(ctx, input).doc(input.scheduleId).get();
    return serialize({ id: document.id, ...document.data() });
  }),

  createSubject: protectedProcedure.input(parseData).mutation(async ({ ctx, input }) => {
    await assertAccess(ctx, input, true);
    const now = new Date();
    const document = childCollection(ctx, input, "subjects").doc();
    const data = { ...input.data, createdAt: now, updatedAt: now };
    await document.set(data);
    return serialize({ id: document.id, ...data });
  }),

  updateSubject: protectedProcedure.input((raw) => {
    const value = asObject(raw);
    return { ...parseData(value), id: asString(value.id, "id") };
  }).mutation(async ({ ctx, input }) => {
    await assertAccess(ctx, input, true);
    const document = childCollection(ctx, input, "subjects").doc(input.id);
    await document.update({ ...input.data, updatedAt: new Date() });
    const updated = await document.get();
    return serialize({ id: updated.id, ...updated.data() });
  }),

  archiveSubject: protectedProcedure.input((raw) => {
    const value = asObject(raw);
    return { ...parseData(value), id: asString(value.id, "id") };
  }).mutation(async ({ ctx, input }) => {
    await assertAccess(ctx, input, true);
    await childCollection(ctx, input, "subjects").doc(input.id).update({ isArchived: true, updatedAt: new Date() });
  }),

  createClassSlot: protectedProcedure.input(parseData).mutation(async ({ ctx, input }) => {
    await assertAccess(ctx, input, true);
    const document = childCollection(ctx, input, "slotVersions").doc();
    const data = { ...input.data, status: "active", supersedes: null, createdAt: new Date(), editReason: input.data.editReason ?? "initial" };
    await document.set(data);
    return serialize({ id: document.id, ...data });
  }),

  applyClassSlotChangePlan: protectedProcedure.input(parseData).mutation(async ({ ctx, input }) => {
    await assertAccess(ctx, input, true);
    const plan = input.data as any;
    if (plan.kind === "exception") {
      const document = childCollection(ctx, input, "exceptions").doc();
      await document.set({ ...plan.exception, status: "active", supersedes: null, createdAt: new Date() });
      return { createdVersionIds: [document.id] };
    }
    const previous = ctx.db.doc(`${input.ownerAccountType}/${input.ownerId}/panels/${input.panelId}/schedule/${input.scheduleId}/slotVersions/${String(plan.closePrevious.versionId)}`);
    const createdIds = await ctx.db.runTransaction(async (transaction: FirebaseFirestore.Transaction) => {
      const snapshot = await transaction.get(previous);
      if (!snapshot.exists || snapshot.data()?.status !== "active") throw new Error("La versión ya fue modificada en otro dispositivo.");
      transaction.update(previous, { status: "superseded", validToWeek: plan.closePrevious.validToWeek });
      const ids: string[] = [];
      for (const version of plan.newVersions ?? []) {
        const document = childCollection(ctx, input, "slotVersions").doc();
        ids.push(document.id);
        transaction.set(document, { ...version, status: "active", supersedes: plan.supersedes, createdAt: new Date() });
      }
      return ids;
    });
    return { createdVersionIds: createdIds };
  }),

  upsertAttendance: protectedProcedure.input(parseData).mutation(async ({ ctx, input }) => {
    await assertAccess(ctx, input, true);
    const data = input.data as any;
    const date = new Date(data.date);
    const localDateKey = date.toISOString().slice(0, 10);
    const id = `${data.slotGroupId}_${localDateKey}`;
    const document = childCollection(ctx, input, "attendance").doc(id);
    const existing = await document.get();
    const payload = { ...data, createdAt: existing.exists ? existing.data()?.createdAt : new Date(), updatedAt: new Date() };
    await document.set(payload);
    return serialize({ id, ...payload });
  }),
});
