import { describe, expect, it, vi, afterEach } from "vitest";
import { downloadBlob } from "../downloadFile";

describe("downloadBlob", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("crea un enlace temporal con el nombre de archivo pedido y hace click", () => {
    const createObjectURL = vi
      .spyOn(URL, "createObjectURL")
      .mockReturnValue("blob:fake-url");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});

    const clickSpy = vi.fn();
    const appendSpy = vi.spyOn(document.body, "appendChild");
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
      const el = originalCreateElement(tag);
      if (tag === "a") el.click = clickSpy;
      return el;
    });

    downloadBlob(new Blob(["contenido"]), "Mi nota.md");

    expect(createObjectURL).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalledTimes(1);
    const anchor = appendSpy.mock.calls[0][0] as HTMLAnchorElement;
    expect(anchor.download).toBe("Mi nota.md");
    expect(anchor.href).toBe("blob:fake-url");
  });

  it("revoca el object URL después de un momento, no de inmediato", () => {
    vi.useFakeTimers();
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:fake-url");
    const revoke = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
      const el = originalCreateElement(tag);
      if (tag === "a") el.click = vi.fn();
      return el;
    });

    downloadBlob(new Blob(["x"]), "a.md");

    expect(revoke).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1000);
    expect(revoke).toHaveBeenCalledWith("blob:fake-url");
  });
});
