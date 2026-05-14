import { useContext } from "react";
import { EventsContext } from "../context/eventsContext";
import type { typeEvent } from "#features/events/domain/events.entity";

interface useEventsOpts {
  filterType: typeEvent;
}

export function useEvents(opts?:useEventsOpts) {
    const context = useContext(EventsContext);

    if (!context) {
      throw new Error("Necesitas tener el contexto dentro del provider");
    }

    return context
}