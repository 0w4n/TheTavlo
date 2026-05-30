import {
  createContext,
  useCallback,
  useEffect,
  useReducer,
  type PropsWithChildren,
} from "react";
import {
  eventsReducer,
  initialEventsState,
  type EventsState,
} from "./eventReducer";
import type { EventsService } from "#features/events/app/events.service";

type EventsContextValue = {
  state: EventsState;
  fetchEvents: () => Promise<void>;
};

export const EventsContext = createContext<EventsContextValue | undefined>(
  undefined,
);

type EventsProviderProp = PropsWithChildren<{ eventsService: EventsService }>;

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
      dispatch({ type: "FETCH_EVENTS_ERROR", payload: error as string });
    }
  }, [eventsService]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const value: EventsContextValue = {
    state,
    fetchEvents,
  };

  return (
    <EventsContext.Provider value={value}>{children}</EventsContext.Provider>
  );
}
