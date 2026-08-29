import type { CreateNoteDTO, Note, UpdateNoteDTO } from "../domain/note.entity";

export interface NoteRepository {
  findAll(): Promise<Note[]>;
  findById(id: string): Promise<Note | null>;
  create(data: CreateNoteDTO): Promise<Note>;
  update(id: string, data: UpdateNoteDTO): Promise<Note>;
  delete(id: string): Promise<void>;
}