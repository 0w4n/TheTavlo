import { createContext, useMemo, useReducer } from "react";
import type { NotesContextValue, NotesProviderProps } from "./noteContext.type";
import { initialNotesState, notesReducer } from "./noteReducer";

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
      dispatch({ type: "FETCH_NOTES_ERROR", payload: error as Error });
    }
  };

  const createNote = async (noteData: { title: string; body: string }) => {
    try {
      await notesService.createNote(noteData);
      dispatch({ type: "CREATE_NOTE_SUCCESS" });
      await fetchNotes();
    } catch (error) {
      dispatch({ type: "FETCH_NOTES_ERROR", payload: error as Error });
    }
  };

  const updateNote = async (
    id: string,
    noteData: { title?: string; body?: string },
  ) => {
    try {
      await notesService.updateNote(id, noteData);
      dispatch({ type: "UPDATE_NOTE_SUCCESS" });
      await fetchNotes();
    } catch (error) {
      dispatch({ type: "FETCH_NOTES_ERROR", payload: error as Error });
    }
  };

  const deleteNote = async (id: string) => {
    try {
      await notesService.deleteNote(id);
      dispatch({ type: "DELETE_NOTE_SUCCESS", payload: id });
    } catch (error) {
      dispatch({ type: "FETCH_NOTES_ERROR", payload: error as Error });
    }
  };

  const selectNote = (note: { id: string; title: string; body: string }) => {
    dispatch({ type: "SELECT_NOTE", payload: note });
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