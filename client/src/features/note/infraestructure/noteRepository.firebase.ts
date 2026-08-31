import type { GlobalContextValue } from "#core/globalContext/context/globalContext";
import { resolvePanelOwner } from "#core/globalContext/resolvePanelOwner";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  Timestamp,
  updateDoc,
  type Firestore,
} from "firebase/firestore";
import type { NoteRepository } from "../app/noteRepository.interface";
import type { Note, CreateNoteDTO, UpdateNoteDTO } from "../domain/note.entity";
import { withoutId } from "#shared/infraestructure/firebase/withoutId";
import { noteConverter } from "./note.converter";

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

  private collectionRef() {
    return collection(this.firestore, this.getCollectionPath()).withConverter(
      noteConverter,
    );
  }

  private docRef(id: string) {
    return doc(this.firestore, this.getCollectionPath(), id).withConverter(
      noteConverter,
    );
  }

  async findAll(): Promise<Note[]> {
    const snap = await getDocs(query(this.collectionRef()));
    return snap.docs.map((d) => d.data());
  }

  async findById(id: string): Promise<Note | null> {
    // Antes: `query(collection(firestore, collPath, id))` — un
    // `collection()` con un número par de segmentos, inválido en
    // Firestore (tira "must have an odd number of segments" en runtime).
    // Buscar UN documento por id es `doc()` + `getDoc()`, no una query.
    const docSnap = await getDoc(this.docRef(id));
    return docSnap.exists() ? docSnap.data() : null;
  }

  async create(data: CreateNoteDTO): Promise<Note> {
    const docRef = await addDoc(this.collectionRef(), data as Note);
    return { ...data, id: docRef.id };
  }

  async update(id: string, data: UpdateNoteDTO): Promise<Note> {
    const now = Timestamp.now();
    const updateData = withoutId({ ...data, updatedAt: now });

    // updateDoc no pasa por el converter (ver withoutId.ts), pero igual
    // acepta una referencia convertida sin problema.
    await updateDoc(this.docRef(id), updateData);

    return { id, ...updateData } as Note;
  }

  async delete(id: string): Promise<void> {
    await deleteDoc(this.docRef(id));
  }
}
