import LoadingPage from "#components/pages/LoadingPage";
import type { Note } from "#features/note/domain/note.entity";
import { useNotes } from "#features/note/presentation/hooks/useNotes";

export default function NoteWidget() {
  const { state } = useNotes();

  if (state.status !== "notes") {
    return <LoadingPage />
  }

  const notes = state.currentNotes;

  return (
    <div>
      <h2>Notes</h2>
      {notes.map((note) => (
        <ItemNote key={note.id} note={note} />
      ))}
    </div>
  );
}

function ItemNote({ note }: { note: Note }) {
  return (
    <div>
      <p>{note.title}</p>
    </div>
  );
}
