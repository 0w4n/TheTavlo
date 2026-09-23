import { describe, expect, it } from "vitest";
import { renderDirtyNoteMarkdown } from "../renderMarkdown";

describe("renderDirtyNoteMarkdown", () => {
  it("convierte Markdown básico a HTML", () => {
    const html = renderDirtyNoteMarkdown("# Título\n\nUn **párrafo**.");
    expect(html).toContain("<h1>Título</h1>");
    expect(html).toContain("<strong>párrafo</strong>");
  });

  it("elimina <script> y su contenido", () => {
    const html = renderDirtyNoteMarkdown('<script>alert("xss")</script>Hola');
    expect(html).not.toContain("<script");
    expect(html).not.toContain("alert");
    expect(html).toContain("Hola");
  });

  it("elimina atributos de evento (onerror, onclick, ...)", () => {
    const html = renderDirtyNoteMarkdown('<img src="x" onerror="alert(1)">');
    expect(html).not.toContain("onerror");
  });

  it("elimina URLs javascript: en enlaces", () => {
    const html = renderDirtyNoteMarkdown("[click](javascript:alert(1))");
    expect(html).not.toContain("javascript:");
  });

  it("prohíbe <style>, <form> y controles interactivos", () => {
    const html = renderDirtyNoteMarkdown(
      '<style>body{display:none}</style><form><input><button>Enviar</button></form>',
    );
    expect(html).not.toContain("<style");
    expect(html).not.toContain("<form");
    expect(html).not.toContain("<input");
    expect(html).not.toContain("<button");
  });

  it("prohíbe el atributo style inline (no se puede tapar la UI real)", () => {
    const html = renderDirtyNoteMarkdown(
      '<div style="position:fixed;top:0;left:0;z-index:99999">hola</div>',
    );
    expect(html).not.toContain("style=");
  });

  it("prohíbe id/name (no debe poder chocar con ids reales de la app)", () => {
    const html = renderDirtyNoteMarkdown('<div id="modal-title" name="x">hola</div>');
    expect(html).not.toContain('id="modal-title"');
    expect(html).not.toContain('name="x"');
  });

  it("agrega target=_blank y rel=noopener a los enlaces", () => {
    const html = renderDirtyNoteMarkdown("[ver](https://example.com)");
    expect(html).toContain('target="_blank"');
    expect(html).toContain("noopener");
  });

  it("renderiza las casillas de tarea como texto, no como <input>", () => {
    const html = renderDirtyNoteMarkdown("- [x] hecho\n- [ ] pendiente");
    expect(html).not.toContain("<input");
    expect(html).toContain("Completada");
    expect(html).toContain("Pendiente");
  });

  it("es idempotente/estable ante contenido vacío", () => {
    expect(renderDirtyNoteMarkdown("")).toBe("");
  });
});
