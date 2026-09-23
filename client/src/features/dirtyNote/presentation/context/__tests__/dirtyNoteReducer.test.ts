import { describe, expect, it } from "vitest";
import { Timestamp } from "firebase/firestore";
import { networkErr } from "#core/appCore/domain/AppCore.type";
import type { DirtyNote } from "#features/dirtyNote/domain/DirtyNote.entity";
import {
  dirtyNoteReducer,
  initialDirtyNoteState,
} from "../dirtyNoteReducer";

const ts = (millis: number) => Timestamp.fromMillis(millis);

function makeDirtyNote(overrides: Partial<DirtyNote> = {}): DirtyNote {
  return {
    id: "note-1",
    title: "Nota",
    content: "contenido",
    status: "sucio",
    createdAt: ts(1000),
    updatedAt: ts(1000),
    ...overrides,
  };
}

describe("dirtyNoteReducer", () => {
  it("empieza en 'loading'", () => {
    expect(initialDirtyNoteState).toEqual({ status: "loading" });
  });

  it("FETCH_START vuelve a 'loading' incluso desde 'ready'", () => {
    const ready = { status: "ready" as const, items: [makeDirtyNote()] };
    expect(dirtyNoteReducer(ready, { type: "FETCH_START" })).toEqual({
      status: "loading",
    });
  });

  it("FETCH_SUCCESS pasa a 'ready' ordenando por updatedAt descendente", () => {
    const older = makeDirtyNote({ id: "a", updatedAt: ts(1000) });
    const newer = makeDirtyNote({ id: "b", updatedAt: ts(2000) });

    const state = dirtyNoteReducer(initialDirtyNoteState, {
      type: "FETCH_SUCCESS",
      payload: [older, newer],
    });

    expect(state.status).toBe("ready");
    if (state.status === "ready") {
      expect(state.items.map((i) => i.id)).toEqual(["b", "a"]);
    }
  });

  it("FETCH_ERROR pasa a 'error' con el AppErr recibido", () => {
    const error = networkErr("sin conexión");
    const state = dirtyNoteReducer(initialDirtyNoteState, {
      type: "FETCH_ERROR",
      payload: error,
    });
    expect(state).toEqual({ status: "error", error });
  });

  it("CREATE_SUCCESS agrega la DirtyNote nueva y reordena", () => {
    const existing = { status: "ready" as const, items: [makeDirtyNote({ id: "a", updatedAt: ts(1000) })] };
    const created = makeDirtyNote({ id: "b", updatedAt: ts(2000) });

    const state = dirtyNoteReducer(existing, { type: "CREATE_SUCCESS", payload: created });

    expect(state.status).toBe("ready");
    if (state.status === "ready") {
      expect(state.items.map((i) => i.id)).toEqual(["b", "a"]);
    }
  });

  it("CREATE_SUCCESS hace upsert: no duplica si el id ya estaba (llegó primero por el snapshot)", () => {
    const already = makeDirtyNote({ id: "a", title: "Original", updatedAt: ts(1000) });
    const existing = { status: "ready" as const, items: [already] };
    const created = makeDirtyNote({ id: "a", title: "Original", updatedAt: ts(1000) });

    const state = dirtyNoteReducer(existing, { type: "CREATE_SUCCESS", payload: created });

    expect(state.status).toBe("ready");
    if (state.status === "ready") {
      expect(state.items).toHaveLength(1);
    }
  });

  it("CREATE_SUCCESS no hace nada si el estado no es 'ready' (evita perder la carga en curso)", () => {
    const state = dirtyNoteReducer(initialDirtyNoteState, {
      type: "CREATE_SUCCESS",
      payload: makeDirtyNote(),
    });
    expect(state).toEqual(initialDirtyNoteState);
  });

  it("UPDATE_SUCCESS fusiona solo los campos que cambiaron", () => {
    const original = makeDirtyNote({ id: "a", title: "Antes", content: "viejo", updatedAt: ts(1000) });
    const existing = { status: "ready" as const, items: [original] };

    const state = dirtyNoteReducer(existing, {
      type: "UPDATE_SUCCESS",
      payload: { id: "a", title: "Después", updatedAt: ts(2000) },
    });

    expect(state.status).toBe("ready");
    if (state.status === "ready") {
      expect(state.items[0]).toEqual({
        ...original,
        title: "Después",
        updatedAt: ts(2000),
      });
    }
  });

  it("UPDATE_SUCCESS no toca otras DirtyNote de la lista", () => {
    const a = makeDirtyNote({ id: "a", updatedAt: ts(1000) });
    const b = makeDirtyNote({ id: "b", title: "B", updatedAt: ts(500) });
    const existing = { status: "ready" as const, items: [a, b] };

    const state = dirtyNoteReducer(existing, {
      type: "UPDATE_SUCCESS",
      payload: { id: "a", status: "final", updatedAt: ts(3000) },
    });

    expect(state.status).toBe("ready");
    if (state.status === "ready") {
      const untouched = state.items.find((i) => i.id === "b");
      expect(untouched).toEqual(b);
    }
  });

  it("DELETE_SUCCESS quita la DirtyNote por id", () => {
    const a = makeDirtyNote({ id: "a" });
    const b = makeDirtyNote({ id: "b" });
    const existing = { status: "ready" as const, items: [a, b] };

    const state = dirtyNoteReducer(existing, { type: "DELETE_SUCCESS", payload: "a" });

    expect(state.status).toBe("ready");
    if (state.status === "ready") {
      expect(state.items.map((i) => i.id)).toEqual(["b"]);
    }
  });
});
