import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../../trpc/trpc.ts";
import { asObject, asOneOf, asString } from "../../trpc/validate.ts";

const COLLECTIONS = ["tasks", "events", "exams", "boards"] as const;
const STRATEGIES = ["move", "merge", "keep-separate"] as const;

function parseMigrationInput(raw: unknown) {
  const value = asObject(raw);
  return {
    sourceGuestId: asString(value.sourceGuestId, "sourceGuestId"),
    targetUserId: asString(value.targetUserId, "targetUserId"),
    strategy: asOneOf(value.strategy, STRATEGIES, "strategy"),
  };
}

async function readGuestCollections(db: FirebaseFirestore.Firestore, guestId: string) {
  return Promise.all(COLLECTIONS.map(async (name) => ({
    name,
    snapshot: await db.collection(`guests/${guestId}/${name}`).get(),
  })));
}

export const migrationRouter = router({
  checkExistingData: protectedProcedure.input((raw) => ({ userId: asString(asObject(raw).userId, "userId") })).query(async ({ ctx, input }) => {
    if (input.userId !== ctx.user.uid) throw new TRPCError({ code: "FORBIDDEN", message: "No puedes consultar los datos de otro usuario." });
    const collections = await Promise.all(COLLECTIONS.map((name) => ctx.db.collection(`users/${input.userId}/${name}`).limit(1).get()));
    return collections.some((snapshot) => !snapshot.empty);
  }),

  migrate: protectedProcedure.input(parseMigrationInput).mutation(async ({ ctx, input }) => {
    if (input.targetUserId !== ctx.user.uid) throw new TRPCError({ code: "FORBIDDEN", message: "El destino debe ser el usuario autenticado." });
    const guestCollections = await readGuestCollections(ctx.db, input.sourceGuestId);
    const itemsMigrated = guestCollections.reduce((total, collection) => total + collection.snapshot.size, 0);
    const batch = ctx.db.batch();

    for (const { name, snapshot } of guestCollections) {
      for (const document of snapshot.docs) {
        if (input.strategy === "keep-separate") {
          batch.delete(document.ref);
          continue;
        }
        const target = input.strategy === "move"
          ? ctx.db.doc(`users/${input.targetUserId}/${name}/${document.id}`)
          : ctx.db.collection(`users/${input.targetUserId}/${name}`).doc();
        batch.set(target, {
          ...document.data(),
          userId: input.targetUserId,
          migratedFrom: input.sourceGuestId,
          migratedAt: new Date(),
        }, { merge: input.strategy === "merge" });
        batch.delete(document.ref);
      }
    }

    await batch.commit();
    return { success: true, newUserId: input.targetUserId, itemsMigrated };
  }),
});
