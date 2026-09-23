import type { NotesService } from "#features/DirtyNote/app/notes.service";
import type { DirtyNote } from "#features/DirtyNote/domain/DirtyNote.entity";
import type { NoteState } from "#features/DirtyNote/presentation/context/noteReducer";
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
  selectNote: (DirtyNote: DirtyNote) => void;
  clearError: () => void;
};

export type NotesProviderProps = PropsWithChildren<{ notesService: NotesService }>;