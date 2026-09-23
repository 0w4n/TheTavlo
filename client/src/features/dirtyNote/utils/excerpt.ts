/**
 * Primera línea con texto de un Markdown, sin la sintaxis, para mostrar como
 * resumen en la lista. No pretende ser un parser: solo quitar lo evidente
 * (`#`, `>`, viñetas, énfasis, enlaces, imágenes).
 */
export function getDirtyNoteExcerpt(content: string, maxLength = 90): string {
  const firstLine =
    content
      .split(/\r?\n/)
      .map((line) => line.trim())
      // Salta líneas vacías, separadores (---) y cercas de código (```).
      .find(
        (line) => line.length > 0 && !/^(-{3,}|\*{3,}|_{3,}|`{3,}.*)$/.test(line),
      ) ?? "";

  const plain = firstLine
    .replace(/^#{1,6}\s+/, "")
    .replace(/^>\s?/, "")
    .replace(/^([-*+]|\d+[.)])\s+(\[[ xX]\]\s+)?/, "")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[*_~`]/g, "")
    .trim();

  // Por puntos de código, para no partir un emoji al cortar.
  const chars = Array.from(plain);
  return chars.length > maxLength
    ? `${chars
        .slice(0, maxLength - 1)
        .join("")
        .trimEnd()}…`
    : plain;
}
