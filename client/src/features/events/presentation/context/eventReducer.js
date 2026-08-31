export const initialEventsState = {
    status: "loading",
};
export function eventsReducer(state, action) {
    switch (action.type) {
        case "FETCH_EVENTS_START":
            return { status: "loading" };
        case "FETCH_EVENTS_SUCCESS":
            return { status: "events", event: action.payload };
        case "FETCH_EVENTS_ERROR":
            return { status: "error", error: action.payload };
        case "CREATE_EVENTS_SUCCESS":
            if (state.status !== "events")
                return state;
            return {
                status: "events",
                event: [...state.event, action.payload]
            };
        case "UPDATE_EVENTS_SUCCESS":
            if (state.status !== "events")
                return state;
            return {
                status: "events",
                event: state.event.map((event) => event.id === action.payload.id ? action.payload : event),
            };
        case "DELETE_EVENTS_SUCCESS":
            if (state.status !== "events")
                return state;
            return {
                status: "events",
                event: state.event.filter((event) => event.id !== action.payload.id),
            };
        case "SELECT_EVENT":
            if (state.status !== "events")
                return state;
            return { ...state, status: "events", selectedEvent: action.payload };
        case "CLEAR_ERROR":
            if (state.status !== "error")
                return state;
            return { status: "error", error: undefined };
        default:
            return state;
    }
}
