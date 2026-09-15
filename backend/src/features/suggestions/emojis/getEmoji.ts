import { GoogleGenAI } from "@google/genai";
import { EmojiRenderError, getEmojiHue } from "./utils";

// Inicialización del SDK de Google Gen AI (Vertex AI)
const ai = new GoogleGenAI({
  enterprise: true,
  project: process.env.GOOGLE_CLOUD_PROJECT,
  location: process.env.GOOGLE_CLOUD_LOCATION,
});

export interface EmojiWithHue {
  emoji: string;
  hue: number;
}

export function buildEmojiHueMap(items: EmojiWithHue[]): Record<string, number> {
  return Object.fromEntries(items.map(({ emoji, hue }) => [emoji, hue]));
}

/**
 * Limpia bloques de código Markdown de la respuesta del modelo.
 *
 * A diferencia de la versión original (que buscaba pares completos
 * ```...```), esto elimina fences de apertura y cierre de forma
 * INDEPENDIENTE. Así, si la respuesta viene truncada (p.ej. por
 * maxOutputTokens) y queda un ``` suelto sin su par, igualmente se limpia.
 */
export function stripMarkdownFences(rawText: string): string {
  return rawText
    .replace(/```[a-zA-Z]*\n?/g, "") // fences de apertura (con o sin lenguaje)
    .replace(/```/g, "") // fences de cierre sueltos
    .trim();
}

/**
 * Determina si un grapheme es un emoji "real" (pictográfico).
 *
 * FIX: se elimina `\p{Emoji}` a secas del regex original. Esa propiedad
 * Unicode es demasiado amplia: incluye dígitos ASCII 0-9, '#' y '*',
 * porque participan en secuencias "keycap" (1️⃣, #️⃣). Sin este fix, una
 * respuesta de Gemini con numeración ("1. 💊 2. 🩺") colaría "1" y "2"
 * como si fueran emojis.
 */
function isRealEmojiGrapheme(value: string): boolean {
  // Red de seguridad extra: cualquier carácter ASCII simple queda excluido
  // explícitamente, independientemente de lo que diga el regex.
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
  const base = `
    You are a specialized emoji generator.
    Your task is to convert the input word into 3 to 6 unique, relevant emojis based STRICTLY on the specified Language & Culture context.

    RULES:
    1. Interpret the input word ONLY as it is used in the specified Language & Culture (e.g., "es_ES" = Spanish Spain).
    2. Completely IGNORE definitions from other languages or regional dialects.
    3. Do NOT include country flag emojis unless the word specifically refers to a country.
    4. STRICT EMOJI ONLY: Return ONLY standard color pictographic emojis (e.g., 💊, 💉, 🩺, 🏥). 
    5. NO SYMBOLS OR TEXT-BASED EMOJIS: Do NOT use legacy Unicode symbols or characters that require variation selectors (such as ⚕, ⚕️, ⚖️, ⚠️, ☣️, ♾️). Use full-color modern emojis only.
    6. Return only raw emoji characters. No text, no spaces, no punctuation, no numbers, no explanations, no repetitions.
  `;

  if (fallback) {
    return `${base}
    7. If the word is ambiguous or less literal, still return the most relevant standard emoji set in the same language/culture, following rule 5.
    `;
  }

  return base;
}

/**
 * Inspecciona metadata de seguridad/bloqueo de la respuesta de Gemini.
 * Esto es clave para diagnosticar casos como "farma": el modelo puede
 * negarse a responder por sus filtros de contenido en lugar de por un
 * fallo de parseo, y sin esto era invisible.
 */
function logSafetyDiagnostics(response: any, attemptLabel: string): void {
  const blockReason = response?.promptFeedback?.blockReason;
  const finishReason = response?.candidates?.[0]?.finishReason;
  const safetyRatings = response?.candidates?.[0]?.safetyRatings;

  if (blockReason) {
    console.warn(`[Gemini][${attemptLabel}] Prompt bloqueado. blockReason=${blockReason}`);
  }
  if (finishReason && finishReason !== "STOP") {
    console.warn(`[Gemini][${attemptLabel}] finishReason inusual: ${finishReason}`);
  }
  if (safetyRatings?.length) {
    console.warn(`[Gemini][${attemptLabel}] safetyRatings:`, JSON.stringify(safetyRatings));
  }
}

/**
 * Calcula el hue de cada emoji de forma tolerante a fallos individuales:
 * si un emoji puntual no se puede renderizar (fuente faltante, etc.), se
 * descarta SOLO ese emoji y se continúa con el resto, en vez de que un
 * único fallo tire abajo todo el lote (como pasaba con el `.map()` original).
 */
function computeHuesSafely(emojis: string[]): EmojiWithHue[] {
  const results: EmojiWithHue[] = [];

  for (const emoji of emojis) {
    try {
      const hue = getEmojiHue(emoji);
      results.push({ emoji, hue });
    } catch (error) {
      if (error instanceof EmojiRenderError) {
        console.error(`[computeHuesSafely] Descartando "${emoji}": ${error.message}`);
      } else {
        console.error(`[computeHuesSafely] Error inesperado calculando hue de "${emoji}":`, error);
      }
      // Se descarta este emoji puntual; el resto del lote sigue su curso.
    }
  }

  return results;
}

// --- SERVICIO DE GEMINI CON CÁLCULO DE HUE ---
export async function fetchEmojisFromGemini(
  word: string,
  lang: string
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

  for (const prompt of prompts) {
    console.log(`[fetchEmojisFromGemini] → ${prompt.label}: llamando a ${prompt.model}`);

    try {
      const response = await ai.models.generateContent({
        model: prompt.model,
        contents: `Language and Culture: "${lang}". Word: "${word}"`,
        config: {
          systemInstruction: prompt.instructions,
          temperature: 0.0,
        },
      });

      logSafetyDiagnostics(response, prompt.label);

      const rawTextBefore = response.text ?? "";
      console.log(
        `[fetchEmojisFromGemini][${prompt.label}] Respuesta cruda (${rawTextBefore.length} chars): "${rawTextBefore}"`
      );

      const rawText = stripMarkdownFences(rawTextBefore);
      if (rawText !== rawTextBefore.trim()) {
        console.log(`[fetchEmojisFromGemini][${prompt.label}] Tras limpiar Markdown: "${rawText}"`);
      }

      const emojiArray = sanitizeEmojiText(rawText);
      console.log(`[fetchEmojisFromGemini][${prompt.label}] Emojis detectados:`, emojiArray);

      if (emojiArray.length === 0) {
        console.warn(
          `[fetchEmojisFromGemini][${prompt.label}] Sin emojis en el texto filtrado para "${word}". ` +
            `Si además ves un blockReason/finishReason registrado arriba, lo más probable es que ` +
            `el modelo haya rechazado la palabra por políticas de contenido, no un fallo de parseo. Reintentando...`
        );
        continue;
      }

      const withHues = computeHuesSafely(emojiArray);

      if (withHues.length === 0) {
        console.warn(
          `[fetchEmojisFromGemini][${prompt.label}] Todos los emojis detectados fallaron al calcular su hue. Reintentando...`
        );
        continue;
      }

      console.log(`[fetchEmojisFromGemini][${prompt.label}] Éxito. Total emojis válidos: ${withHues.length}`);
      return buildEmojiHueMap(withHues);
    } catch (error) {
      console.error(`[fetchEmojisFromGemini][${prompt.label}] Error consultando Gemini:`, error);
    }
  }

  console.error(
    `[fetchEmojisFromGemini] Ambos intentos fallaron para word="${word}" lang="${lang}". Devolviendo objeto vacío.`
  );
  return {};
}

export function buildEmojiHueMapFromText(rawText: string): Record<string, number> {
  const emojiArray = sanitizeEmojiText(rawText);
  const withHues = computeHuesSafely(emojiArray);
  return buildEmojiHueMap(withHues);
}