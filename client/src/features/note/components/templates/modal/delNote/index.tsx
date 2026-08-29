import { Button } from "#components/atoms/button";
import { ModalHeader, ModalFooter } from "#components/molecules/modal";
import { useNotes } from "#features/note/presentation/hooks/useNotes";

interface DelNoteProps {
  id: string;
  onClose: (open: boolean) => void;
}

export default function DelNote({ id, onClose }: DelNoteProps) {
  const { deleteNote } = useNotes();

  return (
    <>
      <ModalHeader title="Eliminar Nota" onClose={onClose} />
      <ModalFooter>
        <Button
          variant="secondary"
          title="Cancelar"
          icon="IconX"
          onClick={() => onClose(false)}
        />
        <Button
          variant="danger"
          title="Eliminar Nota"
          icon="IconTrash"
          onClick={() => deleteNote(id)}
        />
      </ModalFooter>
    </>
  );
}
