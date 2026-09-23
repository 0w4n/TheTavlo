import { describe, expect, it } from "vitest";
import {
  DIRTY_NOTE_CONTENT_MAX_LENGTH,
  DIRTY_NOTE_TITLE_MAX_LENGTH,
  DirtyNoteRules,
} from "../DirtyNote.rules";

describe("DirtyNoteRules.isStatus / toStatus", () => {
  it("acepta los tres estados válidos", () => {
    expect(DirtyNoteRules.isStatus("sucio")).toBe(true);
    expect(DirtyNoteRules.isStatus("en progreso")).toBe(true);
    expect(DirtyNoteRules.isStatus("final")).toBe(true);
  });

  it("rechaza cualquier otro valor", () => {
    expect(DirtyNoteRules.isStatus("Sucio")).toBe(false);
    expect(DirtyNoteRules.isStatus("done")).toBe(false);
    expect(DirtyNoteRules.isStatus(undefined)).toBe(false);
    expect(DirtyNoteRules.isStatus(null)).toBe(false);
    expect(DirtyNoteRules.isStatus(42)).toBe(false);
  });

  it("toStatus cae a 'sucio' ante un valor inválido, sin lanzar", () => {
    expect(DirtyNoteRules.toStatus("algo-raro")).toBe("sucio");
    expect(DirtyNoteRules.toStatus(undefined)).toBe("sucio");
  });

  it("toStatus conserva un valor válido", () => {
    expect(DirtyNoteRules.toStatus("final")).toBe("final");
  });
});

describe("DirtyNoteRules.validateTitle", () => {
  it("recorta espacios y acepta un título válido", () => {
    const result = DirtyNoteRules.validateTitle("  Mi nota  ");
    expect(result).toEqual({ success: true, value: "Mi nota" });
  });

  it("rechaza un título vacío o solo espacios", () => {
    expect(DirtyNoteRules.validateTitle("").success).toBe(false);
    expect(DirtyNoteRules.validateTitle("   ").success).toBe(false);
  });

  it("rechaza un título más largo que el máximo permitido", () => {
    const tooLong = "a".repeat(DIRTY_NOTE_TITLE_MAX_LENGTH + 1);
    const result = DirtyNoteRules.validateTitle(tooLong);
    expect(result.success).toBe(false);
  });

  it("acepta un título justo en el límite", () => {
    const exact = "a".repeat(DIRTY_NOTE_TITLE_MAX_LENGTH);
    expect(DirtyNoteRules.validateTitle(exact).success).toBe(true);
  });
});

describe("DirtyNoteRules.validateContent", () => {
  it("acepta contenido vacío (una DirtyNote puede crearse sin cuerpo)", () => {
    expect(DirtyNoteRules.validateContent("").success).toBe(true);
  });

  it("rechaza contenido más largo que el máximo permitido", () => {
    const tooLong = "a".repeat(DIRTY_NOTE_CONTENT_MAX_LENGTH + 1);
    expect(DirtyNoteRules.validateContent(tooLong).success).toBe(false);
  });
});

describe("DirtyNoteRules.validateStatus", () => {
  it("acepta un estado válido", () => {
    const result = DirtyNoteRules.validateStatus("en progreso");
    expect(result).toEqual({ success: true, value: "en progreso" });
  });

  it("rechaza un estado inválido con un AppErr de validación", () => {
    const result = DirtyNoteRules.validateStatus("wip");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.err.kind).toBe("Validation");
    }
  });
});

describe("DirtyNoteRules.validateCreate", () => {
  it("valida y normaliza los tres campos a la vez", () => {
    const result = DirtyNoteRules.validateCreate({
      title: "  Ideas  ",
      content: "# hola",
      status: "sucio",
    });
    expect(result).toEqual({
      success: true,
      value: { title: "Ideas", content: "# hola", status: "sucio" },
    });
  });

  it("se detiene en el primer campo inválido (título)", () => {
    const result = DirtyNoteRules.validateCreate({
      title: "",
      content: "a".repeat(DIRTY_NOTE_CONTENT_MAX_LENGTH + 1),
      status: "sucio",
    });
    expect(result.success).toBe(false);
    if (!result.success && result.err.kind === "Validation") {
      expect(result.err.fields?.title).toBeDefined();
    } else {
      expect.fail("se esperaba un ValidationErr");
    }
  });
});

describe("DirtyNoteRules.validateUpdate", () => {
  it("con un objeto vacío no valida nada y no falla", () => {
    expect(DirtyNoteRules.validateUpdate({})).toEqual({ success: true, value: {} });
  });

  it("valida solo los campos presentes", () => {
    const result = DirtyNoteRules.validateUpdate({ status: "final" });
    expect(result).toEqual({ success: true, value: { status: "final" } });
  });

  it("rechaza un campo presente pero inválido", () => {
    const result = DirtyNoteRules.validateUpdate({ title: "   " });
    expect(result.success).toBe(false);
  });
});

describe("DirtyNoteRules.isExportable", () => {
  it("es exportable si tiene contenido con texto", () => {
    expect(DirtyNoteRules.isExportable("hola")).toBe(true);
  });

  it("no es exportable si está vacío o solo tiene espacios/saltos de línea", () => {
    expect(DirtyNoteRules.isExportable("")).toBe(false);
    expect(DirtyNoteRules.isExportable("   \n\t  ")).toBe(false);
  });
});

describe("DirtyNoteRules.isLocked", () => {
  it("solo está bloqueada en 'final'", () => {
    expect(DirtyNoteRules.isLocked("final")).toBe(true);
  });

  it("no está bloqueada en 'sucio' ni en 'en progreso'", () => {
    expect(DirtyNoteRules.isLocked("sucio")).toBe(false);
    expect(DirtyNoteRules.isLocked("en progreso")).toBe(false);
  });
});

describe("DirtyNoteRules.buildFileName", () => {
  it("agrega la extensión pedida", () => {
    expect(DirtyNoteRules.buildFileName("Mi nota", "md")).toBe("Mi nota.md");
    expect(DirtyNoteRules.buildFileName("Mi nota", "pdf")).toBe("Mi nota.pdf");
  });

  it("conserva acentos, espacios y mayúsculas", () => {
    expect(DirtyNoteRules.buildFileName("Ideación número 1", "md")).toBe(
      "Ideación número 1.md",
    );
  });

  it("reemplaza caracteres ilegales de nombre de archivo por espacios", () => {
    expect(DirtyNoteRules.buildFileName("Ideas: v2/final?", "md")).toBe(
      "Ideas v2 final.md",
    );
  });

  it("colapsa espacios múltiples resultantes de la limpieza", () => {
    expect(DirtyNoteRules.buildFileName("a///b", "md")).toBe("a b.md");
  });

  it("usa un nombre por defecto si el título queda vacío tras limpiar", () => {
    expect(DirtyNoteRules.buildFileName("   ", "md")).toBe("Sin título.md");
    expect(DirtyNoteRules.buildFileName("///", "md")).toBe("Sin título.md");
  });

  it("evita nombres reservados de Windows anteponiendo un guion bajo", () => {
    expect(DirtyNoteRules.buildFileName("CON", "md")).toBe("_CON.md");
    expect(DirtyNoteRules.buildFileName("con", "pdf")).toBe("_con.pdf");
    expect(DirtyNoteRules.buildFileName("LPT1", "md")).toBe("_LPT1.md");
  });

  it("no deja puntos ni espacios colgando al final (los recorta Windows)", () => {
    expect(DirtyNoteRules.buildFileName("nota...", "md")).toBe("nota.md");
    expect(DirtyNoteRules.buildFileName("nota   ", "md")).toBe("nota.md");
  });

  it("no permite un archivo oculto por punto inicial", () => {
    expect(DirtyNoteRules.buildFileName(".secreto", "md")).toBe("secreto.md");
  });

  it("recorta títulos muy largos sin partir un carácter multibyte", () => {
    const longTitle = "😀".repeat(200);
    const fileName = DirtyNoteRules.buildFileName(longTitle, "md");
    // 100 emojis + ".md", cada emoji cuenta como 1 punto de código.
    expect(Array.from(fileName.replace(/\.md$/, "")).length).toBe(100);
    expect(fileName.endsWith(".md")).toBe(true);
  });
});
