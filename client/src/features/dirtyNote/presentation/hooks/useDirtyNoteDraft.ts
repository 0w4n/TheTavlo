import { useCallback, useEffect, useRef, useState } from "react";
import {
  unexpectedErr,
  type AppErr,
  type ResultApp,
} from "#core/appCore/domain/AppCore.type";
import type {
  DirtyNote,
  DirtyNoteChanges,
  DirtyNoteStatus,
  UpdateDirtyNoteDTO,
} from "#features/dirtyNote/domain/DirtyNote.entity";
import { DirtyNoteRules } from "#features/dirtyNote/domain/DirtyNote.rules";

export type DirtyNoteSaveState =
  /** Todavía no se ha editado nada. */
  | "idle"
  /** Hay cambios que aún no salen hacia el servidor. */
  | "unsaved"
  | "saving"
  | "saved"
  | "error";

type Draft = Pick<DirtyNote, "title" | "content" | "status">;

const toDraft = (dirtyNote: DirtyNote): Draft => ({
  title: dirtyNote.title,
  content: dirtyNote.content,
  status: dirtyNote.status,
});

/**
 * Diferencia entre lo que hay en pantalla (`draft`) y lo último confirmado en
 * el servidor (`saved`): solo los campos que cambiaron.
 *
 * Un título en blanco o demasiado largo NO entra al patch — no se persiste
 * un título inválido; la UI muestra el error mientras tanto y el resto de
 * cambios (contenido, estado) se siguen guardando. Se compara con `trim()`
 * porque lo guardado siempre va recortado.
 */
export function computeDirtyNotePatch(
  draft: Draft,
  saved: Draft,
): UpdateDirtyNoteDTO {
  const patch: UpdateDirtyNoteDTO = {};

  if (draft.content !== saved.content) patch.content = draft.content;
  if (draft.status !== saved.status) patch.status = draft.status;

  const title = draft.title.trim();
  if (title !== saved.title && DirtyNoteRules.validateTitle(title).success) {
    patch.title = title;
  }

  return patch;
}

const hasChanges = (patch: UpdateDirtyNoteDTO) => Object.keys(patch).length > 0;

const sameDraft = (a: Draft, b: Draft) =>
  a.title === b.title && a.content === b.content && a.status === b.status;

export interface UseDirtyNoteDraftOptions {
  /** La DirtyNote tal como está en el store. El hook NO se re-sincroniza con ella salvo que el borrador esté limpio. */
  dirtyNote: DirtyNote;
  onSave: (
    id: string,
    patch: UpdateDirtyNoteDTO,
  ) => Promise<ResultApp<DirtyNoteChanges, AppErr>>;
  /** Un viewer (o un panel aún sin rol resuelto) no edita ni guarda. */
  readOnly?: boolean;
  debounceMs?: number;
}

/**
 * Borrador local de una DirtyNote con autoguardado.
 *
 * - Escribir (título/contenido) guarda tras `debounceMs` sin teclear.
 * - Cambiar el estado guarda de inmediato (es una acción puntual).
 * - Nunca hay dos guardados en vuelo: si el usuario sigue escribiendo
 *   mientras se guarda, al terminar se guarda lo más reciente.
 * - Al desmontar (cerrar el editor) se guarda lo pendiente.
 * - Si otro colaborador cambia la DirtyNote mientras el borrador local está
 *   limpio, se adopta su versión; con ediciones locales sin guardar NO se
 *   pisan (gana lo que el usuario está escribiendo).
 */
export function useDirtyNoteDraft({
  dirtyNote,
  onSave,
  readOnly = false,
  debounceMs = 800,
}: UseDirtyNoteDraftOptions) {
  const [draft, setDraft] = useState<Draft>(() => toDraft(dirtyNote));
  const [saveState, setSaveState] = useState<DirtyNoteSaveState>("idle");
  const [saveError, setSaveError] = useState<AppErr | undefined>(undefined);

  // Refs: los callbacks asíncronos (timer, guardado) necesitan SIEMPRE el
  // valor más reciente, no el capturado cuando se creó la closure.
  const draftRef = useRef<Draft>(draft);
  const savedRef = useRef<Draft>(draft);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const inFlightRef = useRef(false);
  const onSaveRef = useRef(onSave);
  const idRef = useRef(dirtyNote.id);

  useEffect(() => {
    onSaveRef.current = onSave;
    idRef.current = dirtyNote.id;
  });

  const clearTimer = useCallback(() => {
    if (timerRef.current !== undefined) {
      clearTimeout(timerRef.current);
      timerRef.current = undefined;
    }
  }, []);

  const persist = useCallback(async (): Promise<void> => {
    clearTimer();
    if (readOnly || inFlightRef.current) return;

    inFlightRef.current = true;
    try {
      // Bucle en vez de recursión: se repite mientras el usuario haya seguido
      // editando durante el guardado anterior.
      for (;;) {
        const patch = computeDirtyNotePatch(draftRef.current, savedRef.current);

        if (!hasChanges(patch)) {
          setSaveState((prev) => (prev === "idle" ? prev : "saved"));
          return;
        }

        setSaveState("saving");
        setSaveError(undefined);

        const result = await onSaveRef.current(idRef.current, patch);

        if (!result.success) {
          setSaveState("error");
          setSaveError(result.err);
          return;
        }
        savedRef.current = { ...savedRef.current, ...patch };
      }
    } catch (error) {
      setSaveState("error");
      setSaveError(
        unexpectedErr(
          error instanceof Error ? error.message : "Error al guardar",
          error instanceof Error ? error.stack : undefined,
        ),
      );
    } finally {
      inFlightRef.current = false;
    }
  }, [clearTimer, readOnly]);

  const applyChange = useCallback(
    (partial: Partial<Draft>, immediate: boolean) => {
      if (readOnly) return;
      // Defensa en profundidad: la UI ya no muestra el editor de texto
      // cuando está "final", pero si algo igual llamara a setTitle/setContent
      // (p. ej. un atajo de teclado futuro) esto lo ignora sin romper nada.
      // `setStatus` nunca pasa por aquí — es la única forma de desbloquear.
      if (
        DirtyNoteRules.isLocked(draftRef.current.status) &&
        ("title" in partial || "content" in partial)
      ) {
        return;
      }

      const next = { ...draftRef.current, ...partial };
      draftRef.current = next;
      setDraft(next);

      const pending = hasChanges(computeDirtyNotePatch(next, savedRef.current));

      // Durante un guardado en vuelo el indicador sigue en "Guardando…"; el
      // bucle de `persist` recoge esta edición al terminar.
      if (!inFlightRef.current) {
        setSaveState((prev) =>
          pending ? "unsaved" : prev === "idle" ? prev : "saved",
        );
      }

      clearTimer();
      if (!pending) return;

      if (immediate) {
        void persist();
      } else {
        timerRef.current = setTimeout(() => void persist(), debounceMs);
      }
    },
    [clearTimer, debounceMs, persist, readOnly],
  );

  const setTitle = useCallback(
    (title: string) => applyChange({ title }, false),
    [applyChange],
  );
  const setContent = useCallback(
    (content: string) => applyChange({ content }, false),
    [applyChange],
  );
  const setStatus = useCallback(
    (status: DirtyNoteStatus) => applyChange({ status }, true),
    [applyChange],
  );

  /**
   * Descarta lo pendiente sin guardarlo (p. ej. justo después de borrar la
   * DirtyNote: reintentar el guardado al cerrar apuntaría a un documento que
   * ya no existe).
   */
  const discardPending = useCallback(() => {
    clearTimer();
    savedRef.current = {
      ...draftRef.current,
      title: draftRef.current.title.trim(),
    };
  }, [clearTimer]);

  // Guarda lo pendiente al cerrar el editor.
  const persistRef = useRef(persist);
  useEffect(() => {
    persistRef.current = persist;
  });
  useEffect(() => {
    return () => {
      void persistRef.current();
    };
  }, []);

  // Cambios de OTROS colaboradores (o de otra pestaña): se adoptan solo si
  // no hay nada local sin guardar.
  useEffect(() => {
    const remote = toDraft(dirtyNote);
    if (sameDraft(remote, savedRef.current)) return;

    const localIsClean =
      !inFlightRef.current &&
      !hasChanges(computeDirtyNotePatch(draftRef.current, savedRef.current));
    if (!localIsClean) return;

    savedRef.current = remote;
    draftRef.current = remote;
    setDraft(remote);
  }, [dirtyNote]);

  // Avisa antes de cerrar la pestaña con cambios sin guardar.
  const isDirty =
    saveState === "unsaved" || saveState === "saving" || saveState === "error";
  useEffect(() => {
    if (!isDirty) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty]);

  const titleValidation = DirtyNoteRules.validateTitle(draft.title);
  const titleError = titleValidation.success
    ? undefined
    : (titleValidation.err.kind === "Validation" &&
        titleValidation.err.fields?.title) ||
      titleValidation.err.message;

  return {
    draft,
    setTitle,
    setContent,
    setStatus,
    /** Fuerza el guardado ya (Ctrl/Cmd+S, botón "Reintentar"). */
    saveNow: persist,
    discardPending,
    saveState,
    saveError,
    titleError,
    readOnly,
    /** true si el estado es "final": título/contenido dejan de editarse, solo se ve el Markdown renderizado. */
    isLocked: DirtyNoteRules.isLocked(draft.status),
  };
}
