import type { AppErr } from "#core/appCore/domain/AppCore.type";
import type { AnyEvent } from "#features/events/domain/events.entity";
export type EventsState = {
    status: "loading";
} | {
    status: "events";
    event: AnyEvent[];
    selectedEvent?: AnyEvent;
} | {
    status: "error";
    error?: AppErr;
};
type EventsAction = {
    type: "FETCH_EVENTS_START";
} | {
    type: "FETCH_EVENTS_SUCCESS";
    payload: AnyEvent[];
} | {
    type: "FETCH_EVENTS_ERROR";
    payload: AppErr;
} | {
    type: "CREATE_EVENTS_SUCCESS";
    payload: AnyEvent;
} | {
    type: "UPDATE_EVENTS_SUCCESS";
    payload: AnyEvent;
} | {
    type: "DELETE_EVENTS_SUCCESS";
    payload: AnyEvent;
} | {
    type: "SELECT_EVENT";
    payload?: AnyEvent;
} | {
    type: "CLEAR_ERROR";
};
export declare const initialEventsState: EventsState;
export declare function eventsReducer(state: EventsState, action: EventsAction): EventsState;
export {};
