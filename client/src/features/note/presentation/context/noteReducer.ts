import type { AppErr } from "#core/appCore/domain/AppCore.type";
import type { Note } from "#features/note/domain/note.entity";

export type NoteState =
  | {
      status: "loading";
    }
  | {
      status: "notes";
      selectedNotes?: Note;
      currentNotes: Note[];
    }
  | {
      status: "error";
      error?: AppErr;
    };

type NoteAction =
  | { type: "FETCH_NOTES_START" }
  | { type: "FETCH_NOTES_SUCCESS"; payload: Note[] }
  | { type: "FETCH_NOTES_ERROR"; payload: AppErr }
  | { type: "CREATE_NOTE_SUCCESS"; payload: Note }
  | { type: "UPDATE_NOTE_SUCCESS"; payload: Note }
  | { type: "DELETE_NOTE_SUCCESS"; payload: string }
  | { type: "SELECT_NOTE"; payload: Note }
  | { type: "CLEAR_ERROR" };

export const initialNotesState: NoteState = {
  status: "loading",
};

export function notesReducer(
  state: NoteState,
  action: NoteAction,
): NoteState {
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
      if (state.status !== "notes") return state;

      return {
        ...state,
        selectedNotes:
          state.selectedNotes?.id === action.payload.id
            ? action.payload
            : state.selectedNotes,
        currentNotes: state.currentNotes.map((notes) => {
          return notes.id === action.payload.id ? action.payload : notes;
        }),
      };

    case "DELETE_NOTE_SUCCESS":
      if (state.status !== "notes") return state;

      return {
        ...state,
        currentNotes: state.currentNotes.filter(
          (notes) => notes.id !== action.payload,
        ),
        selectedNotes: undefined,
      };

    case "SELECT_NOTE":
      if (state.status !== "notes") return state;

      return { ...state, selectedNotes: action.payload };

    case "CLEAR_ERROR":
      return { status: "error", error: undefined };

    default:
      return state;
  }
}
