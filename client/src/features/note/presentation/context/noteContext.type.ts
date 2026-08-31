import type { NotesService } from "#features/note/app/notes.service";
import type { Note } from "#features/note/domain/note.entity";
import type { NoteState } from "#features/note/presentation/context/noteReducer";
import type { PropsWithChildren } from "react";

export type NotesContextValue = {
  state: NoteState;
  fetchNotes: () => Promise<void>;
  createNote: (noteData: { title: string; body: string }) => Promise<void>;
  updateNote: (
    id: string,
    noteData: { title?: string; body?: string },
  ) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  selectNote: (note: Note) => void;
  clearError: () => void;
};

export type NotesProviderProps = PropsWithChildren<{ notesService: NotesService }>;