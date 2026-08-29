import type { GlobalContextValue } from "#core/globalContext/context/globalContext";
import { resolvePanelOwner } from "#core/globalContext/resolvePanelOwner";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  Timestamp,
  writeBatch,
  type Firestore,
} from "firebase/firestore";
import type { NoteRepository } from "../app/noteRepository.interface";
import type { Note, CreateNoteDTO, UpdateNoteDTO } from "../domain/note.entity";

export class FirebaseNoteRepository implements NoteRepository {
  constructor(
    private firestore: Firestore,
    private getCurrentContext: () => GlobalContextValue,
  ) {}

  private getCollectionPath(): string {
    const ctx = this.getContext();
    const { panelId } = ctx.state.panel;

    if (panelId.length > 0) {
      const { accountType, ownerId } = resolvePanelOwner(ctx);
      return `${accountType}/${ownerId}/panels/${panelId}/notes`;
    }
    const { userId, accountType } = ctx.state.user;
    return `${accountType}/${userId}/panels`;
  }

  private getContext(): GlobalContextValue {
    const ctx = this.getCurrentContext();
    return ctx;
  }

  async findAll(): Promise<Note[]> {
    const collPath = this.getCollectionPath();
    const q = query(collection(this.firestore, collPath));

    return getDocs(q).then((querySnapshot) => {
      return querySnapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as Note,
      );
    });
  }

  async findById(id: string): Promise<Note | null> {
    const collPath = this.getCollectionPath();

    const q = query(collection(this.firestore, collPath, id));

    return getDocs(q).then((querySnapshot) => {
      if (querySnapshot.empty) {
        return null;
      }
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as Note;
    });
  }

  async create(data: CreateNoteDTO): Promise<Note> {
    const collPath = this.getCollectionPath();

    const docRef = await addDoc(collection(this.firestore, collPath), {
      ...data,
    });

    return {
      ...data,
      id: docRef.id,
    };
  }

  async update(id: string, data: UpdateNoteDTO): Promise<Note> {
    const collPath = this.getCollectionPath();

    const docRef = doc(this.firestore, collPath, id);
    const batch = writeBatch(this.firestore);
    
    batch.update(docRef, {
      ...data,
      updatedAt: Timestamp.now(),
    });
    
    await batch.commit();

    return { id, ...data, updatedAt: Timestamp.now() } as Note;
  }

  async delete(id: string): Promise<void> {
    const collPath = this.getCollectionPath();

    const batch = writeBatch(this.firestore);
    const docRef = doc(this.firestore, collPath, id);

    batch.delete(docRef);

    await batch.commit();
  }
}
