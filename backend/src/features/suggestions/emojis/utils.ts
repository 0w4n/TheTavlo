import { createCanvas, GlobalFonts } from "@napi-rs/canvas";
import path from "path";

// Registra la fuente descargada (hazlo una sola vez al iniciar la aplicación)
const fontPath = path.join(
  process.cwd(),
  "src",
  "assets",
  "fonts",
  "NotoColorEmoji.ttf",
);
GlobalFonts.registerFromPath(fontPath, "Noto Color Emoji");

// Cambia el STACK para usar el nombre registrado
const EMOJI_FONT_STACK = `"Noto Color Emoji"`;
/**
 * Error especializado para fallos de renderizado de emoji en canvas.
 * Permite distinguir entre "no se pudo calcular el color" y
 * "el color calculado es realmente rojo/hue=0", que antes se confundían
 * porque la función devolvía 0 en ambos casos.
 */
export class EmojiRenderError extends Error {
  constructor(emoji: String, message: string, cause?: unknown) {
    super(message);
    this.name = "EmojiRenderError";
  }
}

/**
 * Convierte valores RGB a un tono Hue (0 - 360).
 */
function rgbToHue(r: number, g: number, b: number): number {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const delta = max - min;

  if (delta === 0) return 0; // Color acromático (blanco/negro/gris)

  let hue = 0;
  if (max === rNorm) {
    hue = ((gNorm - bNorm) / delta) % 6;
  } else if (max === gNorm) {
    hue = (bNorm - rNorm) / delta + 2;
  } else {
    hue = (rNorm - gNorm) / delta + 4;
  }

  hue = Math.round(hue * 60);
  return hue < 0 ? hue + 360 : hue;
}

/**
 * Renderiza un emoji en un Canvas y calcula su tono Hue promedio.
 *
 * IMPORTANTE (causa frecuente de fallos silenciosos en producción):
 * en entornos headless (Cloud Run, Cloud Functions, contenedores Docker
 * sin fuentes de emoji instaladas), @napi-rs/canvas puede:
 *   a) lanzar una excepción al crear el canvas o el contexto, o
 *   b) renderizar el emoji como un glifo vacío ("tofu"), dejando el
 *      canvas completamente transparente (pixelCount === 0).
 *
 * Ambos casos se tratan ahora como errores explícitos (EmojiRenderError)
 * en lugar de devolver silenciosamente hue = 0, que además coincide con
 * el hue real del color rojo y por tanto enmascaraba el problema.
 */
export function getEmojiHue(emoji: string): number {
  const size = 64;
  let imageData;

  try {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext("2d");

    ctx.font = `${size * 1}px ${EMOJI_FONT_STACK}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(emoji, size / 2, size / 2);

    imageData = ctx.getImageData(0, 0, size, size);
  } catch (error) {
    throw new EmojiRenderError(
      emoji,
      `No se pudo renderizar el emoji "${emoji}" en canvas`,
      error,
    );
  }

  const data = imageData.data;
  let totalR = 0;
  let totalG = 0;
  let totalB = 0;
  let pixelCount = 0;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const alpha = data[i + 3];

    // Solo tomar en cuenta píxeles visibles Y que no sean completamente negros puros (0,0,0)
    if (alpha > 128 && (r > 0 || g > 0 || b > 0)) {
      totalR += r;
      totalG += g;
      totalB += b;
      pixelCount++;
    }
  }

  if (pixelCount === 0) {
    const msg =
      `El emoji "${emoji}" se renderizó vacío (sin píxeles visibles). ` +
      `Probablemente falta una fuente de emoji a color en este entorno ` +
      `(instala "Noto Color Emoji" en el sistema/contenedor).`;
    throw new EmojiRenderError(emoji, msg);
  }

  const avgR = Math.round(totalR / pixelCount);
  const avgG = Math.round(totalG / pixelCount);
  const avgB = Math.round(totalB / pixelCount);

  return rgbToHue(avgR, avgG, avgB);
}
