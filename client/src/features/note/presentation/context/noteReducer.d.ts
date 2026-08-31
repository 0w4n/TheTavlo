import type { AppErr } from "#core/appCore/domain/AppCore.type";
import type { Note } from "#features/note/domain/note.entity";
export type NoteState = {
    status: "loading";
} | {
    status: "notes";
    selectedNotes?: Note;
    currentNotes: Note[];
} | {
    status: "error";
    error?: AppErr;
};
type NoteAction = {
    type: "FETCH_NOTES_START";
} | {
    type: "FETCH_NOTES_SUCCESS";
    payload: Note[];
} | {
    type: "FETCH_NOTES_ERROR";
    payload: AppErr;
} | {
    type: "CREATE_NOTE_SUCCESS";
    payload: Note;
} | {
    type: "UPDATE_NOTE_SUCCESS";
    payload: Note;
} | {
    type: "DELETE_NOTE_SUCCESS";
    payload: string;
} | {
    type: "SELECT_NOTE";
    payload: Note;
} | {
    type: "CLEAR_ERROR";
};
export declare const initialNotesState: NoteState;
export declare function notesReducer(state: NoteState, action: NoteAction): NoteState;
export {};
