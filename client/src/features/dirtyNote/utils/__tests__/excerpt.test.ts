import { describe, expect, it } from "vitest";
import { getDirtyNoteExcerpt } from "../excerpt";

describe("getDirtyNoteExcerpt", () => {
  it("devuelve la primera línea con texto", () => {
    expect(getDirtyNoteExcerpt("Hola mundo\nsegunda línea")).toBe("Hola mundo");
  });

  it("salta líneas vacías iniciales", () => {
    expect(getDirtyNoteExcerpt("\n\n  \nContenido real")).toBe("Contenido real");
  });

  it("salta separadores (---) y cercas de código (```)", () => {
    expect(getDirtyNoteExcerpt("---\n```js\nTexto real")).toBe("Texto real");
  });

  it("quita el marcador de encabezado", () => {
    expect(getDirtyNoteExcerpt("### Un título")).toBe("Un título");
  });

  it("quita el marcador de cita", () => {
    expect(getDirtyNoteExcerpt("> una cita")).toBe("una cita");
  });

  it("quita viñetas y casillas de tarea", () => {
    expect(getDirtyNoteExcerpt("- [x] tarea hecha")).toBe("tarea hecha");
    expect(getDirtyNoteExcerpt("1) primer paso")).toBe("primer paso");
  });

  it("convierte enlaces e imágenes a su texto visible", () => {
    expect(getDirtyNoteExcerpt("[ver más](https://x.com)")).toBe("ver más");
    expect(getDirtyNoteExcerpt("![alt de la imagen](https://x.com/a.png)")).toBe(
      "alt de la imagen",
    );
  });

  it("quita marcas de énfasis", () => {
    expect(getDirtyNoteExcerpt("**negrita** y _cursiva_ y `código`")).toBe(
      "negrita y cursiva y código",
    );
  });

  it("recorta con puntos suspensivos si excede el máximo", () => {
    const excerpt = getDirtyNoteExcerpt("a".repeat(200), 10);
    expect(excerpt).toBe("aaaaaaaaa…");
    expect(excerpt.length).toBe(10);
  });

  it("no corta un emoji a la mitad al recortar", () => {
    const excerpt = getDirtyNoteExcerpt("😀".repeat(50), 10);
    expect(Array.from(excerpt).length).toBe(10);
    expect(excerpt.endsWith("…")).toBe(true);
  });

  it("devuelve vacío si no hay ninguna línea con texto", () => {
    expect(getDirtyNoteExcerpt("\n\n---\n```\n")).toBe("");
  });
});
