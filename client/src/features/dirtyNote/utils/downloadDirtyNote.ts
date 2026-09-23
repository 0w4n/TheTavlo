import type { DirtyNote } from "#features/dirtyNote/domain/DirtyNote.entity";
import { DirtyNoteRules } from "#features/dirtyNote/domain/DirtyNote.rules";
import { downloadBlob } from "./downloadFile";
import { renderDirtyNoteMarkdown } from "./renderMarkdown";

/** Lo mínimo que necesita un export: se exporta el borrador en pantalla, no lo último guardado. */
export type ExportableDirtyNote = Pick<DirtyNote, "title" | "content">;

export class DirtyNoteExportError extends Error {
  constructor(public readonly reason: "empty" | "too-long") {
    super(
      reason === "empty"
        ? "La DirtyNote está vacía: no hay nada que exportar."
        : "La DirtyNote es demasiado larga para exportarla a PDF.",
    );
    this.name = "DirtyNoteExportError";
  }
}

// ─── .md ─────────────────────────────────────────────────────────────────────

/** Descarga el Markdown tal cual, en `{título}.md`. */
export function downloadDirtyNoteAsMarkdown(dirtyNote: ExportableDirtyNote): void {
  if (!DirtyNoteRules.isExportable(dirtyNote.content)) {
    throw new DirtyNoteExportError("empty");
  }

  const blob = new Blob([dirtyNote.content], {
    type: "text/markdown;charset=utf-8",
  });
  downloadBlob(blob, DirtyNoteRules.buildFileName(dirtyNote.title, "md"));
}

// ─── .pdf ────────────────────────────────────────────────────────────────────

const A4_WIDTH_MM = 210;
const PAGE_MARGIN_MM = 15;
const MM_PER_INCH = 25.4;
const CSS_PX_PER_INCH = 96;

/** Ancho útil de una página A4 con márgenes, en px CSS (≈ 680). */
const CONTENT_WIDTH_PX = Math.round(
  ((A4_WIDTH_MM - PAGE_MARGIN_MM * 2) / MM_PER_INCH) * CSS_PX_PER_INCH,
);

// html2pdf dibuja TODO el documento en un único canvas y luego lo corta en
// páginas. Los navegadores limitan el tamaño de un canvas (iOS Safari: ~16.7 M
// de píxeles en total; el resto, ~16 000 px por lado), y pasado el límite el
// resultado sale en blanco sin lanzar error. Por eso la escala baja
// (menos nitidez) cuando la DirtyNote es larga.
const PREFERRED_SCALE = 2;
const MIN_SCALE = 0.75;
const MAX_CANVAS_SIDE_PX = 16_000;
const MAX_CANVAS_AREA_PX = 16_000_000;

/**
 * Escala con la que dibujar un contenido de `widthPx × heightPx` sin superar
 * los límites de canvas. `null` si haría falta una escala tan baja que el
 * texto quedaría ilegible.
 */
export function computePdfScale(widthPx: number, heightPx: number): number | null {
  if (widthPx <= 0 || heightPx <= 0) return PREFERRED_SCALE;

  const byArea = Math.sqrt(MAX_CANVAS_AREA_PX / (widthPx * heightPx));
  const bySide = MAX_CANVAS_SIDE_PX / Math.max(widthPx, heightPx);
  const scale = Math.min(PREFERRED_SCALE, byArea, bySide);

  return scale >= MIN_SCALE ? Math.floor(scale * 100) / 100 : null;
}

/**
 * Estilos del PDF. Van SIEMPRE claros (papel blanco, tinta oscura) aunque la
 * app esté en tema oscuro, y todos bajo `.dirty-note-pdf` para no filtrarse a
 * la app mientras html2pdf mantiene su copia temporal en el documento.
 */
const PDF_STYLES = `
.dirty-note-pdf { box-sizing: border-box; background: #ffffff; color: #1a1a1a;
  font: 12pt/1.6 -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  overflow-wrap: anywhere; }
.dirty-note-pdf *, .dirty-note-pdf *::before, .dirty-note-pdf *::after { box-sizing: border-box; }
.dirty-note-pdf h1, .dirty-note-pdf h2, .dirty-note-pdf h3,
.dirty-note-pdf h4, .dirty-note-pdf h5, .dirty-note-pdf h6 { color: #111111; line-height: 1.25; margin: 1.2em 0 0.5em; }
.dirty-note-pdf > :first-child { margin-top: 0; }
.dirty-note-pdf h1 { font-size: 22pt; border-bottom: 1px solid #d4d4d8; padding-bottom: 0.25em; }
.dirty-note-pdf h2 { font-size: 17pt; border-bottom: 1px solid #e4e4e7; padding-bottom: 0.2em; }
.dirty-note-pdf h3 { font-size: 14pt; }
.dirty-note-pdf h4, .dirty-note-pdf h5, .dirty-note-pdf h6 { font-size: 12pt; }
.dirty-note-pdf p, .dirty-note-pdf ul, .dirty-note-pdf ol,
.dirty-note-pdf blockquote, .dirty-note-pdf pre, .dirty-note-pdf table { margin: 0 0 0.9em; }
.dirty-note-pdf ul, .dirty-note-pdf ol { padding-left: 1.6em; }
.dirty-note-pdf li + li { margin-top: 0.2em; }
.dirty-note-pdf a { color: #1d4ed8; text-decoration: underline; }
.dirty-note-pdf blockquote { padding: 0.2em 1em; border-left: 4px solid #c7c7cc; color: #4b5563; }
.dirty-note-pdf code { background: #f4f4f5; border-radius: 4px; padding: 0.1em 0.35em;
  font: 0.9em "JetBrains Mono", "Fira Code", Consolas, Monaco, monospace; }
.dirty-note-pdf pre { background: #f4f4f5; border-radius: 6px; padding: 0.7em 0.9em; white-space: pre-wrap; }
.dirty-note-pdf pre code { background: none; padding: 0; font-size: 10pt; }
.dirty-note-pdf table { border-collapse: collapse; width: 100%; }
.dirty-note-pdf th, .dirty-note-pdf td { border: 1px solid #d4d4d8; padding: 0.4em 0.7em; text-align: left; }
.dirty-note-pdf th { background: #f4f4f5; }
.dirty-note-pdf img { max-width: 100%; height: auto; }
.dirty-note-pdf hr { border: 0; border-top: 1px solid #d4d4d8; margin: 1.2em 0; }
`;

/**
 * Descarga el contenido RENDERIZADO (no el Markdown crudo) en `{título}.pdf`.
 *
 * `html2pdf.js` (que arrastra html2canvas + jsPDF, cientos de KB) se carga
 * con `import()` dinámico: no pesa en la carga inicial de la app, solo se
 * descarga la primera vez que alguien exporta a PDF.
 *
 * Limitaciones de este enfoque (es el que sugiere html2pdf): el PDF es
 * imagen por página, así que el texto no es seleccionable; y las imágenes
 * remotas de Markdown solo aparecen si su servidor permite CORS.
 */
export async function downloadDirtyNoteAsPdf(
  dirtyNote: ExportableDirtyNote,
): Promise<void> {
  if (!DirtyNoteRules.isExportable(dirtyNote.content)) {
    throw new DirtyNoteExportError("empty");
  }

  const html = renderDirtyNoteMarkdown(dirtyNote.content);
  const fileName = DirtyNoteRules.buildFileName(dirtyNote.title, "pdf");

  // `host` va fuera de pantalla para poder MEDIR la altura real del
  // contenido. Lo que se le pasa a html2pdf es `page`, sin posicionamiento
  // propio: html2pdf lo clona (atributos incluidos) dentro de su overlay, y un
  // `left: -10000px` heredado dejaría el PDF en blanco.
  const host = document.createElement("div");
  host.setAttribute("aria-hidden", "true");
  host.style.cssText = `position:fixed;top:0;left:-100000px;width:${CONTENT_WIDTH_PX}px;pointer-events:none;`;

  const page = document.createElement("div");
  page.className = "dirty-note-pdf";
  page.innerHTML = `<style>${PDF_STYLES}</style>${html}`;

  host.appendChild(page);
  document.body.appendChild(host);

  try {
    const scale = computePdfScale(CONTENT_WIDTH_PX, page.scrollHeight);
    if (scale === null) throw new DirtyNoteExportError("too-long");

    const { default: html2pdf } = await import("html2pdf.js");

    // `pagebreak` es una opción real de html2pdf, pero su archivo de tipos
    // no la declara. Al pasar el objeto por una variable (no como literal)
    // TypeScript no exige que coincida exactamente.
    const options = {
      margin: [PAGE_MARGIN_MM, PAGE_MARGIN_MM, PAGE_MARGIN_MM, PAGE_MARGIN_MM] as [
        number,
        number,
        number,
        number,
      ],
      filename: fileName,
      image: { type: "jpeg" as const, quality: 0.95 },
      html2canvas: {
        scale,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" as const },
      pagebreak: {
        mode: ["css", "legacy"],
        // Evita cortar por la mitad estos bloques al pasar de página.
        avoid: ["h1", "h2", "h3", "h4", "pre", "blockquote", "tr", "img"],
      },
    };

    await html2pdf().set(options).from(page).save();
  } finally {
    host.remove();
  }
}
