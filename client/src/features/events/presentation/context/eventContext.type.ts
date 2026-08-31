import type { EventsService } from "#features/events/app/events.service";
import { createContext, type PropsWithChildren } from "react";
import type { EventsState } from "./eventReducer";

export type EventsContextValue = {
  state: EventsState;
  fetchEvents: () => Promise<void>;
  createEvent: (eventData: { name: string; type: string; makeAt: Date }) => Promise<void>;
};

export const EventsContext = createContext<EventsContextValue | undefined>(
  undefined,
);

export type EventsProviderProp = PropsWithChildren<{ eventsService: EventsService }>;
