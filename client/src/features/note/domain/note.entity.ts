import type { Timestamp } from "firebase/firestore";

export interface Note {
  id: string;
  title: string;
  body: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type CreateNoteDTO = Omit<Note, "id">;
export type UpdateNoteDTO = Partial<Omit<CreateNoteDTO, "createdAt">>;
