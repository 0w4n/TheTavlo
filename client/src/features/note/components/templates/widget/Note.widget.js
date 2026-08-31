import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import LoadingPage from "#components/pages/LoadingPage";
import { useNotes } from "#features/note/presentation/hooks/useNotes";
export default function NoteWidget() {
    const { state } = useNotes();
    if (state.status !== "notes") {
        return _jsx(LoadingPage, {});
    }
    const notes = state.currentNotes;
    return (_jsxs("div", { children: [_jsx("h2", { children: "Notes" }), notes.map((note) => (_jsx(ItemNote, { note: note }, note.id)))] }));
}
function ItemNote({ note }) {
    return (_jsx("div", { children: _jsx("p", { children: note.title }) }));
}
