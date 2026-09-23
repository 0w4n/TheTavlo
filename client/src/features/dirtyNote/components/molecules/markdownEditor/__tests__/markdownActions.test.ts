import { describe, expect, it } from "vitest";
import {
  applyMarkdownAction,
  type MarkdownActionType,
} from "../markdownActions";

/** Azúcar sintáctica: aplica una acción sobre `value` con el rango [start, end). */
function apply(action: MarkdownActionType, value: string, start: number, end = start) {
  return applyMarkdownAction(action, {
    value,
    selectionStart: start,
    selectionEnd: end,
  });
}

describe("applyMarkdownAction — negrita/cursiva/tachado/código (envolver)", () => {
  it("sin selección, inserta un placeholder y lo deja seleccionado", () => {
    const result = apply("bold", "", 0);

    expect(result.value).toBe("**texto en negrita**");
    expect(result.selectionStart).toBe(2);
    expect(result.selectionEnd).toBe(2 + "texto en negrita".length);
  });

  it("con selección, envuelve el texto seleccionado", () => {
    const value = "Hola mundo";
    const start = value.indexOf("mundo");
    const end = start + "mundo".length;

    const result = apply("italic", value, start, end);

    expect(result.value).toBe("Hola *mundo*");
    expect(result.selectionStart).toBe(start + 1);
    expect(result.selectionEnd).toBe(start + 1 + "mundo".length);
  });

  it("aplicar dos veces sobre el mismo texto lo desenvuelve (toggle)", () => {
    const value = "Hola **mundo**";
    const start = value.indexOf("**mundo**");
    const end = start + "**mundo**".length;

    const result = apply("bold", value, start, end);

    expect(result.value).toBe("Hola mundo");
    expect(result.selectionStart).toBe(start);
    expect(result.selectionEnd).toBe(start + "mundo".length);
  });

  it("tachado envuelve con ~~", () => {
    const result = apply("strikethrough", "obsoleto", 0, "obsoleto".length);
    expect(result.value).toBe("~~obsoleto~~");
  });

  it("código en línea envuelve con backtick simple y no se confunde con un bloque", () => {
    const result = apply("code", "const x = 1", 0, "const x = 1".length);
    expect(result.value).toBe("`const x = 1`");
  });
});

describe("applyMarkdownAction — bloque de código", () => {
  it("envuelve la selección en una cerca de triple backtick", () => {
    const value = "const x = 1;";
    const result = apply("codeBlock", value, 0, value.length);

    expect(result.value).toBe("```\nconst x = 1;\n```");
    expect(result.selectionStart).toBe("```\n".length);
    expect(result.selectionEnd).toBe("```\n".length + value.length);
  });

  it("sin selección, usa un placeholder", () => {
    const result = apply("codeBlock", "", 0);
    expect(result.value).toBe("```\ncódigo\n```");
  });
});

describe("applyMarkdownAction — títulos", () => {
  it("agrega el marcador al nivel pedido", () => {
    const value = "Introducción";
    const result = apply("heading2", value, 0, value.length);

    expect(result.value).toBe("## Introducción");
  });

  it("cambiar de nivel reemplaza el marcador anterior, no lo acumula", () => {
    const value = "## Introducción";
    const result = apply("heading1", value, 0, value.length);

    expect(result.value).toBe("# Introducción");
  });

  it("aplicar el mismo nivel dos veces lo quita (toggle)", () => {
    const value = "# Introducción";
    const result = apply("heading1", value, 0, value.length);

    expect(result.value).toBe("Introducción");
  });

  it("solo toca las líneas dentro del rango, respetando las demás", () => {
    const value = "Uno\nDos\nTres";
    const start = value.indexOf("Dos");
    const end = start + "Dos".length;

    const result = apply("heading3", value, start, end);

    expect(result.value).toBe("Uno\n### Dos\nTres");
  });
});

describe("applyMarkdownAction — cita", () => {
  it("agrega '> ' a cada línea del rango", () => {
    const value = "Primera\nSegunda";
    const result = apply("quote", value, 0, value.length);

    expect(result.value).toBe("> Primera\n> Segunda");
  });

  it("aplicarla de nuevo la quita", () => {
    const value = "> Primera\n> Segunda";
    const result = apply("quote", value, 0, value.length);

    expect(result.value).toBe("Primera\nSegunda");
  });

  it("no toca las líneas en blanco del medio", () => {
    const value = "Primera\n\nSegunda";
    const result = apply("quote", value, 0, value.length);

    expect(result.value).toBe("> Primera\n\n> Segunda");
  });
});

describe("applyMarkdownAction — listas", () => {
  it("lista con viñetas: agrega '- ' y lo puede quitar", () => {
    const value = "Uno\nDos";
    const withBullets = apply("bulletList", value, 0, value.length);
    expect(withBullets.value).toBe("- Uno\n- Dos");

    const withoutBullets = apply(
      "bulletList",
      withBullets.value,
      0,
      withBullets.value.length,
    );
    expect(withoutBullets.value).toBe("Uno\nDos");
  });

  it("lista numerada: numera desde 1 y renumera si ya había números", () => {
    const value = "Primero\nSegundo\nTercero";
    const numbered = apply("numberedList", value, 0, value.length);
    expect(numbered.value).toBe("1. Primero\n2. Segundo\n3. Tercero");

    const unNumbered = apply(
      "numberedList",
      numbered.value,
      0,
      numbered.value.length,
    );
    expect(unNumbered.value).toBe("Primero\nSegundo\nTercero");
  });

  it("lista de tareas: agrega '- [ ] ' y también desmarca tareas ya marcadas", () => {
    const value = "Comprar leche";
    const withTask = apply("taskList", value, 0, value.length);
    expect(withTask.value).toBe("- [ ] Comprar leche");

    // Una tarea ya marcada como hecha también se reconoce como "ya es tarea".
    const checked = "- [x] Comprar leche";
    const toggledOff = apply("taskList", checked, 0, checked.length);
    expect(toggledOff.value).toBe("Comprar leche");
  });
});

describe("applyMarkdownAction — enlace e imagen", () => {
  it("enlace sin selección inserta un placeholder de texto, listo para renombrar", () => {
    const result = apply("link", "", 0);

    expect(result.value).toBe("[texto del enlace](url)");
    const expectedStart = "[".length;
    expect(result.selectionStart).toBe(expectedStart);
    expect(result.selectionEnd).toBe(expectedStart + "texto del enlace".length);
  });

  it("enlace con selección la usa como texto visible y deja la URL seleccionada", () => {
    const value = "documentación";
    const result = apply("link", value, 0, value.length);

    expect(result.value).toBe("[documentación](url)");
    const expectedStart = "[documentación](".length;
    expect(result.selectionStart).toBe(expectedStart);
    expect(result.selectionEnd).toBe(expectedStart + "url".length);
  });

  it("imagen sin selección usa un texto alternativo por defecto", () => {
    const result = apply("image", "", 0);
    expect(result.value).toBe("![texto alternativo](url-de-la-imagen)");
  });

  it("imagen con selección la usa como texto alternativo", () => {
    const value = "captura de pantalla";
    const result = apply("image", value, 0, value.length);
    expect(result.value).toBe("![captura de pantalla](url-de-la-imagen)");
  });
});

describe("applyMarkdownAction — línea horizontal y tabla", () => {
  it("línea horizontal se inserta en la posición del cursor", () => {
    const value = "AntesDespués";
    const cursor = "Antes".length;

    const result = apply("horizontalRule", value, cursor);

    expect(result.value).toBe("Antes\n\n---\n\nDespués");
    expect(result.selectionStart).toBe(result.selectionEnd);
  });

  it("tabla inserta un esqueleto y deja seleccionada la primera celda", () => {
    const result = apply("table", "", 0);

    expect(result.value).toBe(
      "| Columna 1 | Columna 2 |\n| --- | --- |\n| Celda 1 | Celda 2 |\n",
    );
    const start = result.value.indexOf("Columna 1");
    expect(result.selectionStart).toBe(start);
    expect(result.selectionEnd).toBe(start + "Columna 1".length);
  });
});
