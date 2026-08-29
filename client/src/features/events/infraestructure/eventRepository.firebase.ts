import {
  collection,
  getDocs,
  query,
  Timestamp,
  where,
  type DocumentData,
  type Firestore,
  // --- NUEVAS IMPORTACIONES PARA LA IMPLEMENTACIÓN ---
  addDoc,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import type { EventRepository } from "../app/eventRepository.interface";
import type { GlobalContextValue } from "#core/globalContext/context/globalContext";
import { resolvePanelOwner } from "#core/globalContext/resolvePanelOwner";
import type {
  CreateAnyEventDTO,
  AnyEvent,
  UpdateAnyEventDTO,
} from "../domain/events.entity";

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

  private mapDocumentToAnyEvent(id: string, data: DocumentData): AnyEvent {
    const event: any = { ...data };

    const eventBase = {
      id: id,
      name: event.name,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    };

    switch (event.type) {
      case "exam":
        return {
          ...eventBase,
          type: "exam",
          makeAt: event.makeAt,
        };

      case "multiDay":
        return {
          ...eventBase,
          type: "multiDay",
          category: event.category,
          startAt: event.startAt,
          endAt: event.endAt,
          location: event.location,
        };

      case "reminder":
        return {
          ...eventBase,
          type: "reminder",
          isRecurring: event.isRecurring,
          recurrenceRule: event.recurrenceRule,
        };

      default:
        return {
          ...eventBase,
          type: "generic",
          startAt: event.startAt,
          endAt: event.endAt,
          location: event.location,
        };
    }
  }

  // --- MÉTODOS IMPLEMENTADOS ---

  async create(data: CreateAnyEventDTO): Promise<AnyEvent> {
    const collectionPath = this.getCollectionPath();
    const collectionRef = collection(this.firestore, collectionPath);

    // Añadimos marcas de tiempo automáticas para la creación
    const payload = {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(collectionRef, payload);
    
    return this.mapDocumentToAnyEvent(docRef.id, payload);
  }

  async findAll(): Promise<AnyEvent[]> {
    const collectionName = this.getCollectionPath();

    const q = query(
      collection(this.firestore, collectionName),
      where("type",  "==", "exam"),
      where("makeAt", ">", Timestamp.now()),
    );

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) =>
      this.mapDocumentToAnyEvent(doc.id, { ...doc.data() }),
    );
  }

  async findById(id: string): Promise<AnyEvent | undefined> {
    const collectionPath = this.getCollectionPath();
    const docRef = doc(this.firestore, collectionPath, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return undefined;
    }

    return this.mapDocumentToAnyEvent(docSnap.id, docSnap.data());
  }

  async update(id: string, data: UpdateAnyEventDTO): Promise<AnyEvent> {
    const collectionPath = this.getCollectionPath();
    const docRef = doc(this.firestore, collectionPath, id);

    // Actualizamos los datos junto con la fecha de modificación
    const payload = {
      ...data,
      updatedAt: Timestamp.now(),
    };

    // Usamos updateDoc para hacer una actualización parcial (solo los campos enviados)
    await updateDoc(docRef, payload);

    // Recuperamos el documento completo para devolver la entidad actualizada
    const updatedSnap = await getDoc(docRef);
    if (!updatedSnap.exists()) {
      throw new Error(`No se pudo encontrar el evento con ID ${id} tras la actualización.`);
    }

    return this.mapDocumentToAnyEvent(updatedSnap.id, updatedSnap.data());
  }

  async delete(id: string): Promise<void> {
    const collectionPath = this.getCollectionPath();
    const docRef = doc(this.firestore, collectionPath, id);
    
    await deleteDoc(docRef);
  }
}