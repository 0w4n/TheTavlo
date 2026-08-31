import type { CreateNoteDTO, UpdateNoteDTO } from "../domain/note.entity";
import type { NoteRepository } from "./noteRepository.interface";
export declare class NotesService {
    private readonly noteRepository;
    constructor(noteRepository: NoteRepository);
    getAllNotes(): Promise<import("../domain/note.entity").Note[]>;
    getNoteById(id: string): Promise<import("../domain/note.entity").Note | null>;
    createNote(data: CreateNoteDTO): Promise<import("../domain/note.entity").Note>;
    updateNote(id: string, data: UpdateNoteDTO): Promise<import("../domain/note.entity").Note>;
    deleteNote(id: string): Promise<void>;
}
