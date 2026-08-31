import type { AppErr } from "#core/appCore/domain/AppCore.type";
import type { AnyEvent } from "#features/events/domain/events.entity";

export type EventsState =
  | { status: "loading" }
  | {
    status: "events";
      event: AnyEvent[];
      selectedEvent?: AnyEvent;
    }
  | {
      status: "error";
      error?: AppErr;
    };

type EventsAction =
  | { type: "FETCH_EVENTS_START" }
  | { type: "FETCH_EVENTS_SUCCESS"; payload: AnyEvent[] }
  | { type: "FETCH_EVENTS_ERROR"; payload: AppErr }
  | { type: "CREATE_EVENTS_SUCCESS"; payload: AnyEvent }
  | { type: "UPDATE_EVENTS_SUCCESS"; payload: AnyEvent }
  | { type: "DELETE_EVENTS_SUCCESS"; payload: AnyEvent }
  | { type: "SELECT_EVENT"; payload?: AnyEvent }
  | { type: "CLEAR_ERROR" };

export const initialEventsState: EventsState = {
  status: "loading",
};

export function eventsReducer(
  state: EventsState,
  action: EventsAction,
): EventsState {
  switch (action.type) {
    case "FETCH_EVENTS_START":
      return { status: "loading"};

    case "FETCH_EVENTS_SUCCESS":
      return { status: "events", event: action.payload };

    case "FETCH_EVENTS_ERROR":
      return { status: "error", error: action.payload };

    case "CREATE_EVENTS_SUCCESS":
      if (state.status !== "events") return state;

      return {
        status: "events",
        event: [...state.event, action.payload]
      };

    case "UPDATE_EVENTS_SUCCESS":
      if (state.status !== "events") return state;

      return {
        status: "events",
        event: state.event.map((event) =>
          event.id === action.payload.id ? action.payload : event,
        ),
      };

    case "DELETE_EVENTS_SUCCESS":
      if (state.status !== "events") return state;

      return {
        status: "events",
        event: state.event.filter((event) => event.id !== action.payload.id),
      };

    case "SELECT_EVENT":
      if (state.status !== "events") return state;

      return { ...state, status: "events", selectedEvent: action.payload };

    case "CLEAR_ERROR":
      if (state.status !== "error") return state;
    
      return { status: "error", error: undefined };

    default:
      return state;
  }
}
