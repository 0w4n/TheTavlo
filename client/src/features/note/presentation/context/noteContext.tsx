import { createContext, useMemo, useReducer } from "react";
import type { NotesContextValue, NotesProviderProps } from "./noteContext.type";
import { initialNotesState, notesReducer } from "./noteReducer";
import { unexpectedErr } from "#core/appCore/domain/AppCore.type";

export const NotesContext = createContext<NotesContextValue | undefined>(
  undefined,
);

export function NotesProvider({ children, notesService }: NotesProviderProps) {
  const [state, dispatch] = useReducer(notesReducer, initialNotesState);

  const fetchNotes = async () => {
    try {
      dispatch({ type: "FETCH_NOTES_START" });
      const notes = await notesService.getAllNotes();
      dispatch({ type: "FETCH_NOTES_SUCCESS", payload: notes });
    } catch (error) {
      const appErr = unexpectedErr(
        error instanceof Error ? error.message : "Error desconocido",
        error instanceof Error ? error.stack : undefined,
      );
      dispatch({ type: "FETCH_NOTES_ERROR", payload: appErr });
    }
  };

  const createNote = async (noteData: { title: string; body: string }) => {
    try {
      const note = await notesService.createNote(noteData);
      dispatch({ type: "CREATE_NOTE_SUCCESS", payload: note });
      await fetchNotes();
    } catch (error) {
      const appErr = unexpectedErr(
        error instanceof Error ? error.message : "Error al crear nota",
        error instanceof Error ? error.stack : undefined,
      );
      dispatch({ type: "FETCH_NOTES_ERROR", payload: appErr });
    }
  };

  const updateNote = async (
    id: string,
    noteData: { title?: string; body?: string },
  ) => {
    try {
      const note = await notesService.updateNote(id, noteData);
      dispatch({ type: "UPDATE_NOTE_SUCCESS", payload: note });
      await fetchNotes();
    } catch (error) {
      const appErr = unexpectedErr(
        error instanceof Error ? error.message : "Error al actualizar nota",
        error instanceof Error ? error.stack : undefined,
      );
      dispatch({ type: "FETCH_NOTES_ERROR", payload: appErr });
    }
  };

  const deleteNote = async (id: string) => {
    try {
      await notesService.deleteNote(id);
      dispatch({ type: "DELETE_NOTE_SUCCESS", payload: id });
    } catch (error) {
      const appErr = unexpectedErr(
        error instanceof Error ? error.message : "Error al eliminar nota",
        error instanceof Error ? error.stack : undefined,
      );
      dispatch({ type: "FETCH_NOTES_ERROR", payload: appErr });
    }
  };

  const selectNote = (note: { id: string; title: string; body: string; createdAt: any; updatedAt: any }) => {
    dispatch({ type: "SELECT_NOTE", payload: note as any });
  };

  const clearError = () => {
    dispatch({ type: "CLEAR_ERROR" });
  };

  const value = useMemo<NotesContextValue>(
    () => ({
      state,
      fetchNotes,
      createNote,
      updateNote,
      deleteNote,
      selectNote,
      clearError,
    }),
    [
      state,
      fetchNotes,
      createNote,
      updateNote,
      deleteNote,
      selectNote,
      clearError,
    ],
  );

  return (
    <NotesContext.Provider value={value}>{children}</NotesContext.Provider>
  );
}