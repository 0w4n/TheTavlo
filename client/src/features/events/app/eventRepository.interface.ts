import type { AnyEvent, CreateAnyEventDTO, UpdateAnyEventDTO } from "../domain/events.entity";

export interface EventRepository {
    findAll(): Promise<AnyEvent[]>;
    findById(id: string): Promise<AnyEvent | undefined>;
    create(data: CreateAnyEventDTO): Promise<AnyEvent>;
    update(id: string, data: UpdateAnyEventDTO): Promise<AnyEvent>;
    delete(id: string): Promise<void>;
}