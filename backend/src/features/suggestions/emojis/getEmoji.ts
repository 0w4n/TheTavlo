import { GoogleGenAI } from "@google/genai";
import { EmojiRenderError, getEmojiHue } from "./utils.ts";

const USE_VERTEX = process.env.GOOGLE_GENAI_USE_VERTEX === "true";

function buildGenAIClient(): GoogleGenAI {
  if (USE_VERTEX) {
    const project = process.env.GOOGLE_CLOUD_PROJECT;
    const location = process.env.GOOGLE_CLOUD_LOCATION;
    if (!project) {
      throw new Error(
        "GOOGLE_GENAI_USE_VERTEX=true pero falta GOOGLE_CLOUD_PROJECT. Revisa example.env.",
      );
    }
    return new GoogleGenAI({ vertexai: true, project, location });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Falta GEMINI_API_KEY. Genera una en https://aistudio.google.com/apikey y añádela a .env.",
    );
  }
  return new GoogleGenAI({ apiKey });
}

const ai = buildGenAIClient();

export interface EmojiWithHue {
  emoji: string;
  hue: number;
}

export function buildEmojiHueMap(
  items: EmojiWithHue[],
): Record<string, number> {
  return Object.fromEntries(items.map(({ emoji, hue }) => [emoji, hue]));
}

export function stripMarkdownFences(rawText: string): string {
  return rawText
    .replace(/```[a-zA-Z]*\n?/g, "")
    .replace(/```/g, "")
    .trim();
}

function isRealEmojiGrapheme(value: string): boolean {
  if (value.length === 1 && value.charCodeAt(0) < 128) return false;
  const emojiRegex = /(\p{Extended_Pictographic}|\p{Emoji_Presentation})/u;
  return emojiRegex.test(value);
}

export function sanitizeEmojiText(rawText: string): string[] {
  const text = (rawText ?? "").trim();
  if (!text) return [];

  const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });
  const seen = new Set<string>();
  const result: string[] = [];

  for (const { segment } of segmenter.segment(text)) {
    const value = segment.normalize("NFC");
    if (!value || value.trim() === "") continue;
    if (!isRealEmojiGrapheme(value)) continue;
    if (seen.has(value)) continue;

    seen.add(value);
    result.push(value);
  }

  return result;
}

function buildEmojiGenerationInstruction(fallback = false): string {
  const base = `You are a specialized emoji generator.
Your task is to convert the input word into 3 to 6 unique, relevant emojis based STRICTLY on the specified Language & Culture context.

RULES:
1. Interpret the input word ONLY as it is used in the specified Language & Culture (e.g., "es_ES" = Spanish Spain).
2. Completely IGNORE definitions from other languages or regional dialects.
3. Do NOT include country flag emojis unless the word specifically refers to a country.
4. STRICT EMOJI ONLY: Return ONLY standard color pictographic emojis (e.g., 💊, 💉, 🩺, 🏥). 
5. NO SYMBOLS OR TEXT-BASED EMOJIS: Do NOT use legacy Unicode symbols or characters that require variation selectors (such as ⚕, ⚕️, ⚖️, ⚠️, ☣️, ♾️). Use full-color modern emojis only.
6. Return only raw emoji characters. No text, no spaces, no punctuation, no numbers, no explanations, no repetitions.`;

  if (fallback) {
    return `${base}\n7. If the word is ambiguous or less literal, still return the most relevant standard emoji set in the same language/culture, following rule 5.`;
  }

  return base;
}

function computeHuesSafely(emojis: string[]): EmojiWithHue[] {
  const results: EmojiWithHue[] = [];

  for (const emoji of emojis) {
    try {
      const hue = getEmojiHue(emoji);
      console.log(`[computeHuesSafely] Emoji "${emoji}" tiene hue: ${hue}`);
      results.push({ emoji, hue });
    } catch (error) {
      if (error instanceof EmojiRenderError) {
        console.error(
          `[computeHuesSafely] Descartando "${emoji}": ${error.message}`,
        );
      } else {
        console.error(
          `[computeHuesSafely] Error inesperado calculando hue de "${emoji}":`,
          error,
        );
      }
    }
  }

  return results;
}

// Extractor seguro del texto en la estructura de respuesta de Interactions
function extractInteractionText(response?: string): string {
  console.log(`[extractInteractionText] response: "${response}"`);
  if (typeof response === "string") {
    return response;
  }
  if (typeof response === "undefined") {
    return "";
  }
  // if (Array.isArray(response?.OutputText)) {
  //   console.log("[extractInteractionText] response.outputs:", response.outputs);
  //   return response.outputs
  //     .map((output: any) => output?.text || output?.content || "")
  //     .join("");
  // }
  return "";
}

// --- SERVICIO DE GEMINI USANDO INTERACTIONS API ---
export async function fetchEmojisFromGemini(
  word: string,
  lang: string,
): Promise<Record<string, number>> {
  const prompts = [
    {
      label: "intento-1 (estricto)",
      model: "gemini-3.1-flash-lite",
      instructions: buildEmojiGenerationInstruction(false),
    },
    {
      label: "intento-2 (fallback)",
      model: "gemini-3.1-flash-lite",
      instructions: buildEmojiGenerationInstruction(true),
    },
  ];

  console.log(`[fetchEmojisFromGemini] word="${word}" lang="${lang}"`);
  
  let infraError: unknown = null;

  for (const prompt of prompts) {
    console.log(
      `[fetchEmojisFromGemini] → ${prompt.label}: llamando a ${prompt.model}`,
    );

    try {
      // Formato correcto según la especificación de Interactions API
      const response = await ai.interactions.create({
        model: prompt.model,
        system_instruction: prompt.instructions,
        input: `Language and Culture: "${lang}". Word: "${word}"`,
        generation_config: {
          max_output_tokens: 100,
        },
      });

      console.log("Response typeof:", typeof response, ", response:", response);
      response
      const rawTextBefore = extractInteractionText(response.output_text);
      console.log(
        `[fetchEmojisFromGemini][${prompt.label}] Respuesta cruda (${rawTextBefore.length} chars): "${rawTextBefore}"`,
      );

      const rawText = stripMarkdownFences(rawTextBefore);
      if (rawText !== rawTextBefore.trim()) {
        console.log(
          `[fetchEmojisFromGemini][${prompt.label}] Tras limpiar Markdown: "${rawText}"`,
        );
      }

      const emojiArray = sanitizeEmojiText(rawText);
      console.log(
        `[fetchEmojisFromGemini][${prompt.label}] Emojis detectados:`,
        emojiArray,
      );

      if (emojiArray.length === 0) {
        console.warn(
          `[fetchEmojisFromGemini][${prompt.label}] Sin emojis en el texto filtrado para "${word}". Reintentando...`,
        );
        continue;
      }

      const withHues = computeHuesSafely(emojiArray);

      if (withHues.length === 0) {
        console.warn(
          `[fetchEmojisFromGemini][${prompt.label}] Todos los emojis detectados fallaron al calcular su hue. Reintentando...`,
        );
        continue;
      }

      console.log(
        `[fetchEmojisFromGemini][${prompt.label}] Éxito. Total emojis válidos: ${withHues.length}`,
      );
      return buildEmojiHueMap(withHues);
    } catch (error) {
      infraError = error;
      console.error(
        `[fetchEmojisFromGemini][${prompt.label}] Error consultando Gemini:`,
        error,
      );
    }
  }

  if (infraError) {
    throw new Error(
      "No se pudo contactar con el servicio de generación de emojis.",
      {
        cause: infraError,
      },
    );
  }

  console.warn(
    `[fetchEmojisFromGemini] Sin emojis de contenido para word="${word}" lang="${lang}".`,
  );
  return {};
}

export function buildEmojiHueMapFromText(
  rawText: string,
): Record<string, number> {
  const emojiArray = sanitizeEmojiText(rawText);
  const withHues = computeHuesSafely(emojiArray);
  return buildEmojiHueMap(withHues);
}