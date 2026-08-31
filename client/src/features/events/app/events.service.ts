import type { AnyEvent } from "../domain/events.entity";
import type { EventRepository } from "./eventRepository.interface";

export class EventsService {
    constructor(private repository: EventRepository) {}

    async getAllEvents(): Promise<AnyEvent[]> {
        return this.repository.findAll();
    }
}