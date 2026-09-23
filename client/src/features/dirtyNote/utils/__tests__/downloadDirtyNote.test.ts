import { describe, expect, it, vi, afterEach } from "vitest";
import {
  DirtyNoteExportError,
  computePdfScale,
  downloadDirtyNoteAsMarkdown,
  downloadDirtyNoteAsPdf,
} from "../downloadDirtyNote";
import * as downloadFileModule from "../downloadFile";

describe("computePdfScale", () => {
  it("usa la escala preferida (2) para un contenido de tamaño normal", () => {
    expect(computePdfScale(680, 1000)).toBe(2);
  });

  it("baja la escala para un contenido alto, sin pasar el límite de área", () => {
    const scale = computePdfScale(680, 10_000);
    expect(scale).not.toBeNull();
    expect(scale!).toBeLessThan(2);
    expect(680 * 10_000 * scale! * scale!).toBeLessThanOrEqual(16_000_000 + 1);
  });

  it("baja la escala para no exceder el límite de 16000px por lado", () => {
    // altura > 16000/2: con escala 2 el lado superaría el límite.
    const scale = computePdfScale(680, 9_000);
    expect(scale).not.toBeNull();
    expect(9_000 * scale!).toBeLessThanOrEqual(16_000);
  });

  it("devuelve null si ni siquiera con la escala mínima entra en el canvas", () => {
    expect(computePdfScale(680, 5_000_000)).toBeNull();
  });

  it("es tolerante a medidas de cero o negativas (devuelve la escala preferida)", () => {
    expect(computePdfScale(0, 0)).toBe(2);
    expect(computePdfScale(-1, 100)).toBe(2);
  });
});

describe("downloadDirtyNoteAsMarkdown", () => {
  afterEach(() => vi.restoreAllMocks());

  it("descarga el contenido tal cual, con el nombre de archivo del título", () => {
    const spy = vi.spyOn(downloadFileModule, "downloadBlob").mockImplementation(() => {});

    downloadDirtyNoteAsMarkdown({ title: "Mi nota", content: "# hola" });

    expect(spy).toHaveBeenCalledTimes(1);
    const [blob, fileName] = spy.mock.calls[0];
    expect(fileName).toBe("Mi nota.md");
    expect(blob.type).toContain("text/markdown");
  });

  it("lanza DirtyNoteExportError('empty') si no hay contenido exportable", () => {
    const spy = vi.spyOn(downloadFileModule, "downloadBlob").mockImplementation(() => {});

    expect(() => downloadDirtyNoteAsMarkdown({ title: "Vacía", content: "   " })).toThrow(
      DirtyNoteExportError,
    );
    expect(spy).not.toHaveBeenCalled();
  });
});

describe("downloadDirtyNoteAsPdf", () => {
  it("rechaza con DirtyNoteExportError('empty') sin tocar el DOM si no hay contenido", async () => {
    const bodyChildrenBefore = document.body.childElementCount;

    await expect(
      downloadDirtyNoteAsPdf({ title: "Vacía", content: "" }),
    ).rejects.toThrow(DirtyNoteExportError);

    // No debe quedar ningún nodo host huérfano en el documento.
    expect(document.body.childElementCount).toBe(bodyChildrenBefore);
  });
});
