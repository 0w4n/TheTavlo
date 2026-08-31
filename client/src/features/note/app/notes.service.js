export class NotesService {
    constructor(noteRepository) {
        Object.defineProperty(this, "noteRepository", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: noteRepository
        });
    }
    async getAllNotes() {
        return this.noteRepository.findAll();
    }
    async getNoteById(id) {
        return this.noteRepository.findById(id);
    }
    async createNote(data) {
        return this.noteRepository.create(data);
    }
    async updateNote(id, data) {
        return this.noteRepository.update(id, data);
    }
    async deleteNote(id) {
        return this.noteRepository.delete(id);
    }
}
