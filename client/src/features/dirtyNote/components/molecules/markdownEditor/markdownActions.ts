/**
 * Transformaciones de texto puras para la barra de herramientas de Markdown.
 *
 * Cada función recibe el texto completo y el rango seleccionado, y devuelve
 * el texto resultante junto con la selección que debería quedar activa (para
 * que, por ejemplo, al poner en negrita quede seleccionado el texto recién
 * envuelto, listo para seguir escribiendo encima). Al ser funciones puras
 * (sin tocar el DOM), se prueban sin necesidad de un textarea real.
 */

export type MarkdownActionType =
  | "bold"
  | "italic"
  | "strikethrough"
  | "code"
  | "codeBlock"
  | "heading1"
  | "heading2"
  | "heading3"
  | "quote"
  | "link"
  | "image"
  | "bulletList"
  | "numberedList"
  | "taskList"
  | "horizontalRule"
  | "table";

export interface TextSelection {
  value: string;
  selectionStart: number;
  selectionEnd: number;
}

export interface MarkdownActionResult {
  value: string;
  selectionStart: number;
  selectionEnd: number;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Envuelve (o desenvuelve, si ya estaba envuelto: es un toggle) la selección. */
function wrapInline(before: string, after: string, placeholder: string) {
  return (value: string, start: number, end: number): MarkdownActionResult => {
    const selected = value.slice(start, end);

    if (
      selected.length >= before.length + after.length &&
      selected.startsWith(before) &&
      selected.endsWith(after)
    ) {
      const unwrapped = selected.slice(before.length, selected.length - after.length);
      return {
        value: value.slice(0, start) + unwrapped + value.slice(end),
        selectionStart: start,
        selectionEnd: start + unwrapped.length,
      };
    }

    const text = selected || placeholder;
    return {
      value: value.slice(0, start) + before + text + after + value.slice(end),
      selectionStart: start + before.length,
      selectionEnd: start + before.length + text.length,
    };
  };
}

/** Línea (o líneas) completas que tocan el rango [start, end). */
function getLineRange(value: string, start: number, end: number) {
  const lineStart = value.lastIndexOf("\n", Math.max(start - 1, 0)) + 1;
  const nextBreak = value.indexOf("\n", end);
  const lineEnd = nextBreak === -1 ? value.length : nextBreak;
  return { lineStart, lineEnd };
}

/**
 * Aplica `transform` a cada línea tocada por la selección y deja
 * seleccionado el bloque completo resultante (no se intenta preservar la
 * selección exacta de antes: es más simple y deja ver de un vistazo qué
 * cambió).
 */
function transformLines(
  value: string,
  start: number,
  end: number,
  transform: (lines: string[]) => string[],
): MarkdownActionResult {
  const { lineStart, lineEnd } = getLineRange(value, start, end);
  const lines = value.slice(lineStart, lineEnd).split("\n");
  const newSegment = transform(lines).join("\n");

  return {
    value: value.slice(0, lineStart) + newSegment + value.slice(lineEnd),
    selectionStart: lineStart,
    selectionEnd: lineStart + newSegment.length,
  };
}

function headingAction(level: 1 | 2 | 3) {
  const marker = `${"#".repeat(level)} `;
  return (value: string, start: number, end: number): MarkdownActionResult =>
    transformLines(value, start, end, (lines) => {
      const allMarked = lines.every((line) => line.trim() === "" || line.startsWith(marker));
      return lines.map((line) => {
        if (line.trim() === "") return line;
        const withoutMarker = line.replace(/^#{1,6}\s+/, "");
        return allMarked ? withoutMarker : `${marker}${withoutMarker}`;
      });
    });
}

function quoteAction(value: string, start: number, end: number): MarkdownActionResult {
  return transformLines(value, start, end, (lines) => {
    const allQuoted = lines.every((line) => line.trim() === "" || line.startsWith("> "));
    return lines.map((line) => {
      if (line.trim() === "") return line;
      return allQuoted ? line.slice(2) : line.startsWith("> ") ? line : `> ${line}`;
    });
  });
}

function bulletListAction(value: string, start: number, end: number): MarkdownActionResult {
  return transformLines(value, start, end, (lines) => {
    const allBulleted = lines.every((line) => line.trim() === "" || line.startsWith("- "));
    return lines.map((line) => {
      if (line.trim() === "") return line;
      return allBulleted ? line.slice(2) : line.startsWith("- ") ? line : `- ${line}`;
    });
  });
}

function numberedListAction(value: string, start: number, end: number): MarkdownActionResult {
  return transformLines(value, start, end, (lines) => {
    const allNumbered = lines.every((line) => line.trim() === "" || /^\d+\.\s/.test(line));
    let n = 0;
    return lines.map((line) => {
      if (line.trim() === "") return line;
      if (allNumbered) return line.replace(/^\d+\.\s/, "");
      n += 1;
      return `${n}. ${line}`;
    });
  });
}

const TASK_MARKER = /^-\s\[[ xX]\]\s/;

function taskListAction(value: string, start: number, end: number): MarkdownActionResult {
  return transformLines(value, start, end, (lines) => {
    const allTasks = lines.every((line) => line.trim() === "" || TASK_MARKER.test(line));
    return lines.map((line) => {
      if (line.trim() === "") return line;
      return allTasks ? line.replace(TASK_MARKER, "") : `- [ ] ${line}`;
    });
  });
}

function codeBlockAction(value: string, start: number, end: number): MarkdownActionResult {
  const before = "```\n";
  const after = "\n```";
  const text = value.slice(start, end) || "código";
  return {
    value: value.slice(0, start) + before + text + after + value.slice(end),
    selectionStart: start + before.length,
    selectionEnd: start + before.length + text.length,
  };
}

function linkAction(value: string, start: number, end: number): MarkdownActionResult {
  const selected = value.slice(start, end);

  if (selected) {
    const before = `[${selected}](`;
    const url = "url";
    return {
      value: value.slice(0, start) + before + url + ")" + value.slice(end),
      selectionStart: start + before.length,
      selectionEnd: start + before.length + url.length,
    };
  }

  const before = "[";
  const text = "texto del enlace";
  return {
    value: value.slice(0, start) + before + text + "](url)" + value.slice(end),
    selectionStart: start + before.length,
    selectionEnd: start + before.length + text.length,
  };
}

function imageAction(value: string, start: number, end: number): MarkdownActionResult {
  const selected = value.slice(start, end);

  if (selected) {
    const before = `![${selected}](`;
    const url = "url-de-la-imagen";
    return {
      value: value.slice(0, start) + before + url + ")" + value.slice(end),
      selectionStart: start + before.length,
      selectionEnd: start + before.length + url.length,
    };
  }

  const before = "![";
  const alt = "texto alternativo";
  return {
    value: value.slice(0, start) + before + alt + "](url-de-la-imagen)" + value.slice(end),
    selectionStart: start + before.length,
    selectionEnd: start + before.length + alt.length,
  };
}

function horizontalRuleAction(
  value: string,
  start: number,
  end: number,
): MarkdownActionResult {
  const insertion = "\n\n---\n\n";
  const cursor = start + insertion.length;
  return {
    value: value.slice(0, start) + insertion + value.slice(end),
    selectionStart: cursor,
    selectionEnd: cursor,
  };
}

const TABLE_SKELETON =
  "| Columna 1 | Columna 2 |\n| --- | --- |\n| Celda 1 | Celda 2 |\n";

function tableAction(value: string, start: number, end: number): MarkdownActionResult {
  const newValue = value.slice(0, start) + TABLE_SKELETON + value.slice(end);
  // Deja seleccionado "Columna 1", justo tras "| ", para renombrarla ya.
  const selectionStart = start + 2;
  return {
    value: newValue,
    selectionStart,
    selectionEnd: selectionStart + "Columna 1".length,
  };
}

// ─── Dispatcher ─────────────────────────────────────────────────────────────

export function applyMarkdownAction(
  action: MarkdownActionType,
  selection: TextSelection,
): MarkdownActionResult {
  const { value, selectionStart: start, selectionEnd: end } = selection;

  switch (action) {
    case "bold":
      return wrapInline("**", "**", "texto en negrita")(value, start, end);
    case "italic":
      return wrapInline("*", "*", "texto en cursiva")(value, start, end);
    case "strikethrough":
      return wrapInline("~~", "~~", "texto tachado")(value, start, end);
    case "code":
      return wrapInline("`", "`", "código")(value, start, end);
    case "codeBlock":
      return codeBlockAction(value, start, end);
    case "heading1":
      return headingAction(1)(value, start, end);
    case "heading2":
      return headingAction(2)(value, start, end);
    case "heading3":
      return headingAction(3)(value, start, end);
    case "quote":
      return quoteAction(value, start, end);
    case "bulletList":
      return bulletListAction(value, start, end);
    case "numberedList":
      return numberedListAction(value, start, end);
    case "taskList":
      return taskListAction(value, start, end);
    case "link":
      return linkAction(value, start, end);
    case "image":
      return imageAction(value, start, end);
    case "horizontalRule":
      return horizontalRuleAction(value, start, end);
    case "table":
      return tableAction(value, start, end);
    default: {
      // Exhaustividad: si se agrega un MarkdownActionType sin implementarlo
      // acá, esto falla a compilar en vez de silenciosamente no hacer nada.
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}
