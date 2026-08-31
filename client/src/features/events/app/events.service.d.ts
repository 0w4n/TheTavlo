import type { AnyEvent } from "../domain/events.entity";
import type { EventRepository } from "./eventRepository.interface";
export declare class EventsService {
    private repository;
    constructor(repository: EventRepository);
    getAllEvents(): Promise<AnyEvent[]>;
}
