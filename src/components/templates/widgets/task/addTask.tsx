import { Button } from "#components/atoms/button";
import { Modal } from "#components/molecules/modal";

interface Props {
  onClose: () => void;
}

export function AddTask({ onClose }: Props) {
  return (
    <>
      <Modal.Header onClose={onClose}>
        <h2 id="modal__title">Agregar Widget</h2>
      </Modal.Header>
      <Modal.Body>
        <div><span>Aquí va contenido</span></div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose} label="Cancelar" />
      </Modal.Footer>
    </>
  );
}
