import { type Firestore } from "firebase/firestore";
import type { EventRepository } from "../app/eventRepository.interface";
import type { GlobalContextValue } from "#core/globalContext/context/globalContext";
import type { CreateAnyEventDTO, AnyEvent, UpdateAnyEventDTO } from "../domain/events.entity";
export declare class FirebaseEventRepository implements EventRepository {
    private firestore;
    private getCurrentContext;
    constructor(firestore: Firestore, getCurrentContext: () => GlobalContextValue);
    private getCollectionPath;
    private getContext;
    private collectionRef;
    private docRef;
    create(data: CreateAnyEventDTO): Promise<AnyEvent>;
    findAll(): Promise<AnyEvent[]>;
    findById(id: string): Promise<AnyEvent | undefined>;
    update(id: string, data: UpdateAnyEventDTO): Promise<AnyEvent>;
    delete(id: string): Promise<void>;
}
