import { useCallback, useEffect, useReducer } from "react";
import { eventsReducer, initialEventsState } from "./eventReducer";
import type { AppErr } from "#core/appCore/domain/AppCore.type";
import {
  EventsContext,
  type EventsContextValue,
  type EventsProviderProp,
} from "./eventContext.type";
import type { AnyEvent } from "#features/events/domain/events.entity";

export function EventsProvider({
  children,
  eventsService,
}: EventsProviderProp) {
  const [state, dispatch] = useReducer(eventsReducer, initialEventsState);

  const fetchEvents = useCallback(async () => {
    dispatch({ type: "FETCH_EVENTS_START" });

    try {
      const events = await eventsService.getAllEvents();

      dispatch({ type: "FETCH_EVENTS_SUCCESS", payload: events });
    } catch (error) {
      dispatch({ type: "FETCH_EVENTS_ERROR", payload: error as AppErr });
    }
  }, [eventsService]);

  const createEvent = useCallback(
    async (eventData: AnyEvent) => {
      dispatch({ type: "CREATE_EVENTS_SUCCESS", payload: eventData });
    },
    [eventsService]
  );

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const value: EventsContextValue = {
    state,
    fetchEvents,
    createEvent,
  };

  return (
    <EventsContext.Provider value={value}>{children}</EventsContext.Provider>
  );
}
