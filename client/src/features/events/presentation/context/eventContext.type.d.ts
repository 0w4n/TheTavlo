import type { EventsService } from "#features/events/app/events.service";
import { type PropsWithChildren } from "react";
import type { EventsState } from "./eventReducer";
import type { AnyEvent } from "#features/events/domain/events.entity";
export type EventsContextValue = {
    state: EventsState;
    fetchEvents: () => Promise<void>;
    createEvent: (eventData: AnyEvent) => Promise<void>;
};
export declare const EventsContext: import("react").Context<EventsContextValue | undefined>;
export type EventsProviderProp = PropsWithChildren<{
    eventsService: EventsService;
}>;
