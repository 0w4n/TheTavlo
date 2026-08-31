export const initialNotesState = {
    status: "loading",
};
export function notesReducer(state, action) {
    switch (action.type) {
        case "FETCH_NOTES_START":
            return { status: "loading" };
        case "FETCH_NOTES_SUCCESS":
            return { status: "notes", currentNotes: action.payload };
        case "FETCH_NOTES_ERROR":
            return { status: "error", error: action.payload };
        case "CREATE_NOTE_SUCCESS":
            return state;
        case "UPDATE_NOTE_SUCCESS":
            if (state.status !== "notes")
                return state;
            return {
                ...state,
                selectedNotes: state.selectedNotes?.id === action.payload.id
                    ? action.payload
                    : state.selectedNotes,
                currentNotes: state.currentNotes.map((notes) => {
                    return notes.id === action.payload.id ? action.payload : notes;
                }),
            };
        case "DELETE_NOTE_SUCCESS":
            if (state.status !== "notes")
                return state;
            return {
                ...state,
                currentNotes: state.currentNotes.filter((notes) => notes.id !== action.payload),
                selectedNotes: undefined,
            };
        case "SELECT_NOTE":
            if (state.status !== "notes")
                return state;
            return { ...state, selectedNotes: action.payload };
        case "CLEAR_ERROR":
            return { status: "error", error: undefined };
        default:
            return state;
    }
}
