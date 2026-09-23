import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { Timestamp } from "firebase/firestore";
import { err, ok, validationErr } from "#core/appCore/domain/AppCore.type";
import type {
  DirtyNote,
  DirtyNoteChanges,
} from "#features/dirtyNote/domain/DirtyNote.entity";
import {
  computeDirtyNotePatch,
  useDirtyNoteDraft,
} from "../useDirtyNoteDraft";

const ts = (millis: number) => Timestamp.fromMillis(millis);

function makeDirtyNote(overrides: Partial<DirtyNote> = {}): DirtyNote {
  return {
    id: "note-1",
    title: "Título",
    content: "contenido",
    status: "sucio",
    createdAt: ts(0),
    updatedAt: ts(0),
    ...overrides,
  };
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("computeDirtyNotePatch", () => {
  const saved = { title: "Original", content: "hola", status: "sucio" as const };

  it("no incluye campos que no cambiaron", () => {
    expect(computeDirtyNotePatch(saved, saved)).toEqual({});
  });

  it("incluye content y status cuando cambian", () => {
    const draft = { ...saved, content: "chau", status: "final" as const };
    expect(computeDirtyNotePatch(draft, saved)).toEqual({
      content: "chau",
      status: "final",
    });
  });

  it("recorta el título y lo incluye solo si es válido", () => {
    const draft = { ...saved, title: "  Nuevo título  " };
    expect(computeDirtyNotePatch(draft, saved)).toEqual({ title: "Nuevo título" });
  });

  it("NO incluye un título vacío (el guardado se queda con el anterior)", () => {
    const draft = { ...saved, title: "   " };
    expect(computeDirtyNotePatch(draft, saved)).toEqual({});
  });
});

describe("useDirtyNoteDraft", () => {
  it("escribir contenido guarda tras el debounce, no antes", async () => {
    const onSave = vi.fn().mockResolvedValue(ok({ id: "note-1", updatedAt: ts(1) }));
    const { result } = renderHook(() =>
      useDirtyNoteDraft({ dirtyNote: makeDirtyNote(), onSave, debounceMs: 500 }),
    );

    act(() => result.current.setContent("nuevo contenido"));
    expect(onSave).not.toHaveBeenCalled();
    expect(result.current.saveState).toBe("unsaved");

    await act(async () => {
      vi.advanceTimersByTime(500);
      await Promise.resolve();
    });

    expect(onSave).toHaveBeenCalledWith("note-1", { content: "nuevo contenido" });
  });

  it("cambiar el estado guarda de inmediato, sin esperar el debounce", async () => {
    const onSave = vi.fn().mockResolvedValue(ok({ id: "note-1", updatedAt: ts(1) }));
    const { result } = renderHook(() =>
      useDirtyNoteDraft({ dirtyNote: makeDirtyNote(), onSave, debounceMs: 5000 }),
    );

    await act(async () => {
      result.current.setStatus("final");
      await Promise.resolve();
    });

    expect(onSave).toHaveBeenCalledWith("note-1", { status: "final" });
  });

  it("varias teclas seguidas dentro del debounce producen un único guardado", async () => {
    const onSave = vi.fn().mockResolvedValue(ok({ id: "note-1", updatedAt: ts(1) }));
    const { result } = renderHook(() =>
      useDirtyNoteDraft({ dirtyNote: makeDirtyNote(), onSave, debounceMs: 500 }),
    );

    act(() => result.current.setContent("a"));
    act(() => vi.advanceTimersByTime(200));
    act(() => result.current.setContent("ab"));
    act(() => vi.advanceTimersByTime(200));
    act(() => result.current.setContent("abc"));

    await act(async () => {
      vi.advanceTimersByTime(500);
      await Promise.resolve();
    });

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith("note-1", { content: "abc" });
  });

  it("si se edita durante un guardado en curso, al terminar se guarda lo más reciente", async () => {
    let resolveFirst: (value: ReturnType<typeof ok<{ id: string; updatedAt: Timestamp }>>) => void;
    const firstCall = new Promise((resolve) => {
      resolveFirst = resolve;
    });
    const onSave = vi
      .fn()
      .mockImplementationOnce(() => firstCall)
      .mockResolvedValueOnce(ok({ id: "note-1", updatedAt: ts(2) }));

    const { result } = renderHook(() =>
      useDirtyNoteDraft({ dirtyNote: makeDirtyNote(), onSave, debounceMs: 100 }),
    );

    act(() => result.current.setContent("primero"));
    await act(async () => {
      vi.advanceTimersByTime(100);
      await Promise.resolve();
    });
    expect(onSave).toHaveBeenCalledTimes(1);

    // Se sigue editando MIENTRAS el primer guardado sigue en vuelo.
    act(() => result.current.setContent("segundo"));
    await act(async () => {
      vi.advanceTimersByTime(100);
      await Promise.resolve();
    });
    // El segundo guardado no debería dispararse todavía: el primero sigue en vuelo.
    expect(onSave).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveFirst(ok({ id: "note-1", updatedAt: ts(1) }));
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(onSave).toHaveBeenCalledTimes(2);
    expect(onSave).toHaveBeenLastCalledWith("note-1", { content: "segundo" });
  });

  it("un error de guardado se refleja en saveState/saveError y no se pierde el borrador", async () => {
    const failure = validationErr("no se pudo", { title: "inválido" });
    const onSave = vi.fn().mockResolvedValue(err(failure));

    const { result } = renderHook(() =>
      useDirtyNoteDraft({ dirtyNote: makeDirtyNote(), onSave, debounceMs: 100 }),
    );

    act(() => result.current.setContent("algo"));
    await act(async () => {
      vi.advanceTimersByTime(100);
      await Promise.resolve();
    });

    expect(result.current.saveState).toBe("error");
    expect(result.current.saveError).toEqual(failure);
    expect(result.current.draft.content).toBe("algo");
  });

  it("saveNow permite reintentar manualmente tras un error", async () => {
    const onSave = vi
      .fn()
      .mockResolvedValueOnce(err(validationErr("falló")))
      .mockResolvedValueOnce(ok({ id: "note-1", updatedAt: ts(2) }));

    const { result } = renderHook(() =>
      useDirtyNoteDraft({ dirtyNote: makeDirtyNote(), onSave, debounceMs: 100 }),
    );

    act(() => result.current.setContent("algo"));
    await act(async () => {
      vi.advanceTimersByTime(100);
      await Promise.resolve();
    });
    expect(result.current.saveState).toBe("error");

    await act(async () => {
      await result.current.saveNow();
    });

    expect(result.current.saveState).toBe("saved");
    expect(onSave).toHaveBeenCalledTimes(2);
  });

  it("en modo readOnly no llama a onSave aunque se intente escribir", async () => {
    const onSave = vi.fn();
    const { result } = renderHook(() =>
      useDirtyNoteDraft({
        dirtyNote: makeDirtyNote(),
        onSave,
        readOnly: true,
        debounceMs: 50,
      }),
    );

    act(() => result.current.setContent("intento"));
    await act(async () => {
      vi.advanceTimersByTime(200);
      await Promise.resolve();
    });

    expect(onSave).not.toHaveBeenCalled();
    // El readOnly del hook no debe reflejar el intento en el borrador.
    expect(result.current.draft.content).toBe("contenido");
  });

  it("adopta una actualización remota cuando el borrador local está limpio", async () => {
    const onSave = vi.fn().mockResolvedValue(ok({ id: "note-1", updatedAt: ts(1) }));
    const { result, rerender } = renderHook(
      ({ dirtyNote }) => useDirtyNoteDraft({ dirtyNote, onSave, debounceMs: 100 }),
      { initialProps: { dirtyNote: makeDirtyNote() } },
    );

    const remoteUpdate = makeDirtyNote({ content: "cambiado por otro", updatedAt: ts(5) });
    act(() => rerender({ dirtyNote: remoteUpdate }));

    expect(result.current.draft.content).toBe("cambiado por otro");
  });

  it("NO pisa una edición local sin guardar con una actualización remota", async () => {
    // Nunca resuelve: simula un guardado en vuelo/pendiente.
    const onSave = vi.fn(
      () => new Promise<ReturnType<typeof ok<DirtyNoteChanges>>>(() => {}),
    );
    const { result, rerender } = renderHook(
      ({ dirtyNote }) => useDirtyNoteDraft({ dirtyNote, onSave, debounceMs: 10_000 }),
      { initialProps: { dirtyNote: makeDirtyNote() } },
    );

    act(() => result.current.setContent("mi edición local"));

    const remoteUpdate = makeDirtyNote({ content: "cambiado por otro", updatedAt: ts(5) });
    rerender({ dirtyNote: remoteUpdate });

    expect(result.current.draft.content).toBe("mi edición local");
  });

  it("titleError refleja un título en blanco sin bloquear el resto de campos", () => {
    const onSave = vi.fn();
    const { result } = renderHook(() =>
      useDirtyNoteDraft({ dirtyNote: makeDirtyNote(), onSave }),
    );

    act(() => result.current.setTitle("   "));

    expect(result.current.titleError).toBeTruthy();
  });

  it("isLocked es true cuando la DirtyNote arranca en 'final'", () => {
    const onSave = vi.fn();
    const { result } = renderHook(() =>
      useDirtyNoteDraft({
        dirtyNote: makeDirtyNote({ status: "final" }),
        onSave,
      }),
    );

    expect(result.current.isLocked).toBe(true);
  });

  it("con estado 'final' ignora setTitle/setContent pero setStatus sigue funcionando", async () => {
    const onSave = vi.fn().mockResolvedValue(ok({ id: "note-1", updatedAt: ts(1) }));
    // Referencia estable a propósito: igual que en producción (el snapshot de
    // Firestore no cambia de referencia salvo que llegue una actualización
    // real), para no disparar el efecto de "actualización remota" en cada
    // re-render y así aislar el comportamiento de setTitle/setContent/setStatus.
    const dirtyNote = makeDirtyNote({ status: "final" });
    const { result } = renderHook(() =>
      useDirtyNoteDraft({ dirtyNote, onSave, debounceMs: 50 }),
    );

    act(() => result.current.setTitle("Otro título"));
    act(() => result.current.setContent("Otro contenido"));
    await act(async () => {
      vi.advanceTimersByTime(200);
      await Promise.resolve();
    });

    // Ni el título ni el contenido cambiaron, y no se llamó a onSave.
    expect(result.current.draft.title).toBe("Título");
    expect(result.current.draft.content).toBe("contenido");
    expect(onSave).not.toHaveBeenCalled();

    // Cambiar el estado SÍ funciona: es la única salida del bloqueo.
    await act(async () => {
      result.current.setStatus("sucio");
      await Promise.resolve();
    });

    expect(onSave).toHaveBeenCalledWith("note-1", { status: "sucio" });
    expect(result.current.isLocked).toBe(false);

    // Una vez desbloqueada, volver a escribir funciona con normalidad.
    act(() => result.current.setContent("ahora sí"));
    await act(async () => {
      vi.advanceTimersByTime(50);
      await Promise.resolve();
    });

    expect(onSave).toHaveBeenCalledWith("note-1", { content: "ahora sí" });
  });
});
