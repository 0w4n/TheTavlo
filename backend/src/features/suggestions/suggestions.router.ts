import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../../trpc/trpc.ts";
import { asObject, asString } from "../../trpc/validate.ts";
import { fetchEmojisFromGemini } from "./getEmoji.ts";

export interface EmojiInput {
  word: string;
  lang: string;
}

export function parseEmojiInput(raw: unknown): EmojiInput {
  const value = asObject(raw);

  console.log("Value parsed:", value);

  return {
    word: value.word === undefined ? "" : asString(value.word, "word"),
    lang: value.lang === undefined ? "es_es" : asString(value.lang, "lang"),
  };
}

export async function getEmojiSuggestions(input: EmojiInput): Promise<string> {
  try {
    return await fetchEmojisFromGemini(input.word, input.lang);
  } catch (err) {
    console.error("Emoji suggestion failed:", err);
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
  }
}

export const suggestionsRouter = router({
  emoji: protectedProcedure.input(parseEmojiInput).query(async ({ input }) => {
    return getEmojiSuggestions(input);
  }),

  schedule: protectedProcedure.query(async ({ ctx }) => {
    const schedule = await ctx.db.collection("schedule").get();

    return schedule.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  }),
});
