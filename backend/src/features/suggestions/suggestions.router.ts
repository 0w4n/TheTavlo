import { router, protectedProcedure } from "../../trpc/trpc.ts";
import { asObject, asString } from "../../trpc/validate.ts";
import { fetchEmojisFromGemini } from "./getEmoji.ts";

interface EmojiInput {
    word: string;
    lang: string;
}

function parseEmojiInput(raw: unknown): EmojiInput {
    const value = asObject(raw);

    return {
        word: value.word === undefined ? "" : asString(value.word, "word"),
        lang: value.lang === undefined ? "es_es" : asString(value.lang, "lang")
    };
}

export const suggestionsRouter = router({
    emoji: protectedProcedure.input(parseEmojiInput).query(async ({ input }) => {
        return fetchEmojisFromGemini(input.word, input.lang);
    }),

    schedule: protectedProcedure.query(async ({ ctx }) => {
        const schedule = await ctx.db.collection("schedule").get();

        return schedule.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
        }));
    })
})
