import { GoogleGenAI} from "@google/genai";

// Inicialización del SDK de Google Gen AI (Vertex AI)
const ai = new GoogleGenAI({
  enterprise: true,
  project: process.env.GOOGLE_CLOUD_PROJECT,
  location: process.env.GOOGLE_CLOUD_LOCATION,
});

// --- SERVICIO DE GEMINI CON SOPORTE DE IDIOMA ---
export async function fetchEmojisFromGemini(
  word: string,
  lang: string
): Promise<string> {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-lite",
    // Pasamos el contexto explícito del idioma en el Prompt de usuario
    contents: `Language&Culture: "${lang}"\nInput word: "${word}"`,
    config: {
      systemInstruction: `
        You are a specialized emoji generator.
        Your task is to convert the input word into 3 to 6 unique, relevant emojis based STRICTLY on the specified Language & Culture context.
        
        RULES:
        1. Interpret the input word ONLY as it is used in the specified Language & Culture (e.g., "es_ES" = Spain Spanish).
        2. Completely IGNORE definitions from other languages (like English) or other regional dialects (like Latin America).
        3. Do NOT include country flag emojis unless the word specifically refers to a country.
        4. Output ONLY the emojis (3 to 6 unique emojis). No text, no spaces, no punctuation, no repetitions.`,
      temperature: 0.0, // Temperatura más baja para máxima precisión semántica
    },
  });

  return response.text ? response.text.trim() : "";
}
