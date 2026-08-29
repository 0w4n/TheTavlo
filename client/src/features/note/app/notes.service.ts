import type { CreateNoteDTO, UpdateNoteDTO } from "../domain/note.entity";
import type { NoteRepository } from "./noteRepository.interface";

export class NotesService {
  constructor(private readonly noteRepository: NoteRepository) {}

  async getAllNotes() {
    return this.noteRepository.findAll();
  }

  async getNoteById(id: string) {
    return this.noteRepository.findById(id);
  }

  async createNote(data: CreateNoteDTO) {
    return this.noteRepository.create(data);
  }

  async updateNote(id: string, data: UpdateNoteDTO) {
    return this.noteRepository.update(id, data);
  }

  async deleteNote(id: string) {
    return this.noteRepository.delete(id);
  }
}
