import { TRPCError } from "@trpc/server";
import type { QueryDocumentSnapshot } from "firebase-admin/firestore";
import { router, protectedProcedure, publicProcedure } from "../../trpc/trpc.js";
import { asObject, asString } from "../../trpc/validate.js";
import { fetchEmojisFromGemini } from "./emojis/getEmoji.js";

export interface EmojiInput {
  word: string;
  lang: string;
}

export function parseEmojiInput(raw: unknown): EmojiInput {
  const value = asObject(raw);

  console.log("Value parsed:", value);

  const word = asString(value.word, "word").trim();
  const lang =
    value.lang === undefined ? "es_es" : asString(value.lang, "lang").trim();
  if (word.length > 80) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: '"word" no puede superar los 80 caracteres.',
    });
  }
  if (lang.length > 20) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: '"lang" no puede superar los 20 caracteres.',
    });
  }

  return { word, lang };
}

export async function getEmojiSuggestions(input: EmojiInput): Promise<Record<string, number>> {
  try {
    return await fetchEmojisFromGemini(input.word, input.lang);
  } catch (err) {
    console.error("Emoji suggestion failed:", err);
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
  }
}

export const suggestionsRouter = router({
  emoji: publicProcedure.input(parseEmojiInput).query(async ({ input }) => {
    console.log("Input:", input);
    return getEmojiSuggestions(input);
  }),

  schedule: protectedProcedure.query(async ({ ctx }) => {
    const schedule = await ctx.db.collection("schedule").get();

    return schedule.docs.map((doc: QueryDocumentSnapshot) => ({
      id: doc.id,
      ...doc.data(),
    }));
  }),
});
