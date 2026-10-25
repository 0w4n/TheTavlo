import { GoogleGenAI, FunctionCallingConfigMode } from "@google/genai";
import { registry } from "./actions.types.js";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! }); // en el BACKEND

const systemInstruction = () => `
Eres el asistente de TheTavlo. Ahora mismo es ${new Date().toLocaleString("es-ES", {
  dateStyle: "full", timeStyle: "short", timeZone: "Europe/Madrid" })} (Europe/Madrid).
Traduce las peticiones del usuario en llamadas a las funciones disponibles.
Resuelve fechas relativas ("el viernes", "esta tarde") a fechas ISO absolutas.
Si falta un dato imprescindible, pregunta en lugar de inventarlo.
Nunca afirmes que algo se ha creado: solo se crea cuando recibes el resultado de la función.
`;

export async function proposeAction(history: any[]) {
  const res = await ai.models.generateContent({
    model: "gemini-2.5-flash", // comprueba el modelo vigente en la documentación
    contents: history,
    config: {
      systemInstruction: systemInstruction(),
      tools: [{ functionDeclarations: registry.declarations() }],
      toolConfig: { functionCallingConfig: { mode: FunctionCallingConfigMode.AUTO } },
    },
  });

  const call = res.functionCalls?.[0];
  if (!call) return { type: "text" as const, text: res.text };

  const action = registry.get(call.name!);
  if (!action) throw new Error(`Acción desconocida: ${call.name}`);

  const args = action.validate(call.args);          // nunca confíes en la salida del modelo
  if (!action.requiresConfirmation) {
    const result = await action.execute(args);      // lecturas: se ejecutan directamente
    return { type: "executed" as const, result };
  }
  return { type: "preview" as const, call, preview: action.preview(args), args };
}

export async function confirmAction(name: string, args: unknown) {
  const action = registry.get(name)!;
  return action.execute(action.validate(args));
}