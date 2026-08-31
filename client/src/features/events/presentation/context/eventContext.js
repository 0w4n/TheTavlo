import { jsx as _jsx } from "react/jsx-runtime";
import { useCallback, useEffect, useReducer } from "react";
import { eventsReducer, initialEventsState } from "./eventReducer";
import { EventsContext, } from "./eventContext.type";
export function EventsProvider({ children, eventsService, }) {
    const [state, dispatch] = useReducer(eventsReducer, initialEventsState);
    const fetchEvents = useCallback(async () => {
        dispatch({ type: "FETCH_EVENTS_START" });
        try {
            const events = await eventsService.getAllEvents();
            dispatch({ type: "FETCH_EVENTS_SUCCESS", payload: events });
        }
        catch (error) {
            dispatch({ type: "FETCH_EVENTS_ERROR", payload: error });
        }
    }, [eventsService]);
    const createEvent = useCallback(async (eventData) => {
        dispatch({ type: "CREATE_EVENTS_SUCCESS", payload: eventData });
    }, [eventsService]);
    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);
    const value = {
        state,
        fetchEvents,
        createEvent,
    };
    return (_jsx(EventsContext.Provider, { value: value, children: children }));
}
