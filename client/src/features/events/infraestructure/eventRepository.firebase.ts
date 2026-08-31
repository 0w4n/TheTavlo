import {
  collection,
  getDocs,
  query,
  Timestamp,
  where,
  type Firestore,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import type { EventRepository } from "../app/eventRepository.interface";
import type { GlobalContextValue } from "#core/globalContext/context/globalContext";
import { resolvePanelOwner } from "#core/globalContext/resolvePanelOwner";
import { withoutId } from "#shared/infraestructure/firebase/withoutId";
import type {
  CreateAnyEventDTO,
  AnyEvent,
  UpdateAnyEventDTO,
} from "../domain/events.entity";
import { eventConverter } from "./event.converter";

export class FirebaseEventRepository implements EventRepository {
  constructor(
    private firestore: Firestore,
    private getCurrentContext: () => GlobalContextValue,
  ) {}

  private getCollectionPath(): string {
    const ctx = this.getContext();
    const { accountType, ownerId } = resolvePanelOwner(ctx);
    const { panelId } = ctx.state.panel;
    return `${accountType}/${ownerId}/panels/${panelId}/event`;
  }

  private getContext(): GlobalContextValue {
    const ctx = this.getCurrentContext();
    if (!ctx) {
      throw new Error("GlobalContext no disponible");
    }
    return ctx;
  }

  private collectionRef() {
    return collection(this.firestore, this.getCollectionPath()).withConverter(
      eventConverter,
    );
  }

  private docRef(id: string) {
    return doc(this.firestore, this.getCollectionPath(), id).withConverter(
      eventConverter,
    );
  }

  async create(data: CreateAnyEventDTO): Promise<AnyEvent> {
    const now = Timestamp.now();
    const payload = { ...data, createdAt: now, updatedAt: now } as AnyEvent;

    const docRef = await addDoc(this.collectionRef(), payload);
    return { ...payload, id: docRef.id };
  }

  // ⚠️ Sin cambios de comportamiento: sigue devolviendo solo exámenes
  // futuros, no "todos los eventos" (bug preexistente ya reportado en la
  // auditoría — no se toca en este cambio, que es solo mappers -> withConverter).
  async findAll(): Promise<AnyEvent[]> {
    const q = query(
      this.collectionRef(),
      where("type", "==", "exam"),
      where("makeAt", ">", Timestamp.now()),
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => doc.data());
  }

  async findById(id: string): Promise<AnyEvent | undefined> {
    const docSnap = await getDoc(this.docRef(id));
    return docSnap.exists() ? docSnap.data() : undefined;
  }

  async update(id: string, data: UpdateAnyEventDTO): Promise<AnyEvent> {
    const now = Timestamp.now();
    const payload = withoutId({ ...data, updatedAt: now });

    await updateDoc(this.docRef(id), payload);
    return { id, ...payload } as AnyEvent;
  }

  async delete(id: string): Promise<void> {
    await deleteDoc(this.docRef(id));
  }
}
