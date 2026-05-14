import type { AnyEvent, Event } from "#features/events/domain/events.entity";

export type EventsState = {
  event: AnyEvent[];
  loading: boolean;
  error?: string;
  selectedEvent?: Event;
};

type EventsAction =
  | { type: "FETCH_EVENTS_START" }
  | { type: "FETCH_EVENTS_SUCCESS"; payload: AnyEvent[] }
  | { type: "FETCH_EVENTS_ERROR"; payload: string }
  | { type: "CREATE_EVENTS_SUCCESS"; payload: AnyEvent }
  | { type: "UPDATE_EVENTS_SUCCESS"; payload: AnyEvent }
  | { type: "DELETE_EVENTS_SUCCESS"; payload: AnyEvent }
  | { type: "SELECT_EVENT"; payload?: Event }
  | { type: "CLEAR_ERROR" };

export const initialEventsState: EventsState = {
  event: [],
  loading: true,
  error: undefined,
  selectedEvent: undefined,
};

export function eventsReducer(
  state: EventsState,
  action: EventsAction,
): EventsState {
  switch (action.type) {
    case "FETCH_EVENTS_START":
      return { ...state, loading: true, error: undefined };

    case "FETCH_EVENTS_SUCCESS":
      return { ...state, loading: false, event: action.payload };

    case "FETCH_EVENTS_ERROR":
      return { ...state, loading: false, error: action.payload };

    case "CREATE_EVENTS_SUCCESS":
      return {
        ...state,
        event: [...state.event, action.payload],
        error: undefined,
      };

    case "UPDATE_EVENTS_SUCCESS":
      return {
        ...state,
        event: state.event.map((event) =>
          event.id === action.payload.id ? action.payload : event,
        ),
        error: undefined,
      };

    case "DELETE_EVENTS_SUCCESS":
        return {
            ...state,
            event: state.event.filter((event) => event.id !== action.payload.id),
            error: undefined
        }

    case "SELECT_EVENT":
      return { ...state, selectedEvent: action.payload };

    case "CLEAR_ERROR":
      return { ...state, error: undefined };

    default:
      return state;
  }
}
