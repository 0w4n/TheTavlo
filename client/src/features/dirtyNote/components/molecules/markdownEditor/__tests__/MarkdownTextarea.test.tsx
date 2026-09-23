import { useState } from "react";
import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MarkdownTextarea } from "../MarkdownTextarea";

/**
 * Envoltorio con estado propio, igual que como lo usan `DirtyNoteEditor` y
 * `AddDirtyNote`: `MarkdownTextarea` es un componente controlado y no
 * gestiona su propio valor.
 */
function Harness({
  initialValue = "",
  disabled = false,
  readOnly = false,
}: {
  initialValue?: string;
  disabled?: boolean;
  readOnly?: boolean;
}) {
  const [value, setValue] = useState(initialValue);
  return (
    <MarkdownTextarea
      value={value}
      onChange={setValue}
      disabled={disabled}
      readOnly={readOnly}
      aria-label="contenido"
    />
  );
}

function getTextarea() {
  return screen.getByRole("textbox", { name: "contenido" }) as HTMLTextAreaElement;
}

/** Espera un frame de animación real: a esa altura el rAF interno del
 * componente (que restaura foco/selección) ya se ejecutó, porque se agendó
 * primero. */
function waitForAnimationFrame() {
  return new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
}

describe("MarkdownTextarea", () => {
  it("escribir directamente en el textarea funciona con normalidad", () => {
    render(<Harness />);
    const textarea = getTextarea();

    fireEvent.change(textarea, { target: { value: "hola" } });

    expect(textarea.value).toBe("hola");
  });

  it("el botón de negrita envuelve la selección y la deja resaltada", async () => {
    render(<Harness initialValue="Hola mundo" />);
    const textarea = getTextarea();

    const start = textarea.value.indexOf("mundo");
    textarea.setSelectionRange(start, start + "mundo".length);

    fireEvent.click(screen.getByRole("button", { name: /negrita/i }));

    expect(textarea.value).toBe("Hola **mundo**");

    await waitForAnimationFrame();

    const expectedStart = "Hola **".length;
    expect(textarea.selectionStart).toBe(expectedStart);
    expect(textarea.selectionEnd).toBe(expectedStart + "mundo".length);
  });

  it("aplicar negrita dos veces sobre el mismo texto la quita", () => {
    render(<Harness initialValue="Hola **mundo**" />);
    const textarea = getTextarea();

    const start = textarea.value.indexOf("**mundo**");
    textarea.setSelectionRange(start, start + "**mundo**".length);

    fireEvent.click(screen.getByRole("button", { name: /negrita/i }));

    expect(textarea.value).toBe("Hola mundo");
  });

  it("Ctrl+B aplica negrita igual que el botón, sin escribir una 'b' literal", () => {
    render(<Harness initialValue="mundo" />);
    const textarea = getTextarea();
    textarea.setSelectionRange(0, "mundo".length);

    fireEvent.keyDown(textarea, { key: "b", ctrlKey: true });

    expect(textarea.value).toBe("**mundo**");
  });

  it("Ctrl+K inserta un enlace", () => {
    render(<Harness initialValue="" />);
    const textarea = getTextarea();

    fireEvent.keyDown(textarea, { key: "k", ctrlKey: true });

    expect(textarea.value).toBe("[texto del enlace](url)");
  });

  it("un botón de título antepone el marcador a la línea", () => {
    render(<Harness initialValue="Introducción" />);
    const textarea = getTextarea();
    textarea.setSelectionRange(0, 0);

    fireEvent.click(screen.getByRole("button", { name: "Título 2" }));

    expect(textarea.value).toBe("## Introducción");
  });

  it("oculta la barra de herramientas si el campo está deshabilitado", () => {
    render(<Harness initialValue="texto" disabled />);
    expect(screen.queryByRole("toolbar")).not.toBeInTheDocument();
  });

  it("oculta la barra de herramientas si el campo es de solo lectura", () => {
    render(<Harness initialValue="texto" readOnly />);
    expect(screen.queryByRole("toolbar")).not.toBeInTheDocument();
  });

  it("con la barra oculta, un atajo de teclado no modifica el contenido", () => {
    render(<Harness initialValue="mundo" disabled />);
    const textarea = getTextarea();

    fireEvent.keyDown(textarea, { key: "b", ctrlKey: true });

    expect(textarea.value).toBe("mundo");
  });
});
