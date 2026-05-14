import {
  collection,
  getDocs,
  query,
  Timestamp,
  where,
  type DocumentData,
  type Firestore,
} from "firebase/firestore";
import type { EventRepository } from "../app/eventRepository.interface";
import type { GlobalContextValue } from "#core/globalContext/context/globalContext";
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
    const { userId, accountType } = this.getContext().state.user;
    const { panelId } = this.getContext().state.panel;
    return `${accountType}/${userId}/panels/${panelId}/event`;
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

  async create(data: CreateAnyEventDTO): Promise<AnyEvent> {
    const collectionName = this.getCollectionPath();
  }

  async findAll(): Promise<AnyEvent[]> {
    const collectionName = this.getCollectionPath();

    const q = query(
      collection(this.firestore, collectionName),
      where("type",  "==", "exam"),
      where("makeAt", ">", Timestamp.now()),
    );

    console.log("Query: ", q);

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) =>
      this.mapDocumentToAnyEvent(doc.id, { ...doc.data() }),
    );
  }

  async findById(id: string): Promise<AnyEvent | undefined> {
    return undefined;
  }

  async update(id: string, data: UpdateAnyEventDTO): Promise<AnyEvent> {}

  async delete(id: string): Promise<void> {}
}
