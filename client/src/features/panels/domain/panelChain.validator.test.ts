import { describe, expect, it } from "vitest";
import { validatePanelChain } from "./panelChain.validator";
import type { Panel } from "./panel.entity";
import type { DocumentReference, Timestamp } from "firebase/firestore";

const now = {} as Timestamp;

function refTo(id: string): DocumentReference {
  return { id } as DocumentReference;
}

function makePanel(id: string, parentId: string | null): Panel {
  return {
    id,
    parentId: parentId ? refTo(parentId) : null,
    name: id,
    color: 0,
    icon: "",
    sharedWith: null,
    createdAt: now,
    updatedAt: now,
  };
}

function indexById(panels: Panel[]): Map<string, Panel> {
  return new Map(panels.map((p) => [p.id, p]));
}

describe("validatePanelChain", () => {
  it("acepta un solo panel raíz (sin padre)", () => {
    const a = makePanel("a", null);
    expect(validatePanelChain(["a"], indexById([a]))).toEqual({ valid: true });
  });

  it("acepta una cadena correctamente anidada de varios niveles", () => {
    const a = makePanel("a", null);
    const b = makePanel("b", "a");
    const c = makePanel("c", "b");
    const d = makePanel("d", "c");

    expect(
      validatePanelChain(["a", "b", "c", "d"], indexById([a, b, c, d])),
    ).toEqual({ valid: true });
  });

  it("rechaza un id que no existe en absoluto", () => {
    const a = makePanel("a", null);
    expect(validatePanelChain(["a", "ghost"], indexById([a]))).toEqual({
      valid: false,
      reason: "missing",
      panelId: "ghost",
    });
  });

  it("rechaza cuando el primer panel de la cadena SÍ tiene padre en la base de datos", () => {
    // La URL dice "a es la raíz", pero en Firestore "a" cuelga de otro panel.
    const a = makePanel("a", "some-other-parent");
    expect(validatePanelChain(["a"], indexById([a]))).toEqual({
      valid: false,
      reason: "broken-link",
      panelId: "a",
    });
  });

  it("rechaza un eslabón salteado (b no es hijo directo de a)", () => {
    const a = makePanel("a", null);
    const b = makePanel("b", null); // debería ser hijo de "a", pero es raíz
    expect(validatePanelChain(["a", "b"], indexById([a, b]))).toEqual({
      valid: false,
      reason: "broken-link",
      panelId: "b",
    });
  });

  it("rechaza cuando el panel intermedio no coincide (URL combina dos ramas distintas del árbol)", () => {
    const a = makePanel("a", null);
    const b = makePanel("b", "a");
    const x = makePanel("x", null); // rama paralela, no relacionada con a/b
    const y = makePanel("y", "x");

    // "a/b/y" — y es hijo real de x, no de b.
    expect(
      validatePanelChain(["a", "b", "y"], indexById([a, b, x, y])),
    ).toEqual({ valid: false, reason: "broken-link", panelId: "y" });
  });

  it("cadena vacía es válida (nada que validar)", () => {
    expect(validatePanelChain([], new Map())).toEqual({ valid: true });
  });
});
