import type { GlobalContextValue } from "#core/globalContext/context/globalContext";
import { type Firestore } from "firebase/firestore";
import type { NoteRepository } from "../app/noteRepository.interface";
import type { Note, CreateNoteDTO, UpdateNoteDTO } from "../domain/note.entity";
export declare class FirebaseNoteRepository implements NoteRepository {
    private firestore;
    private getCurrentContext;
    constructor(firestore: Firestore, getCurrentContext: () => GlobalContextValue);
    private getCollectionPath;
    private getContext;
    private collectionRef;
    private docRef;
    findAll(): Promise<Note[]>;
    findById(id: string): Promise<Note | null>;
    create(data: CreateNoteDTO): Promise<Note>;
    update(id: string, data: UpdateNoteDTO): Promise<Note>;
    delete(id: string): Promise<void>;
}
