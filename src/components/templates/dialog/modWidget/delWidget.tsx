import { Modal } from "#components/molecules/modal";
import { Button } from "#components/atoms/button";

interface Prop {
  onClose: () => void;
  onDelete: () => void;
}
export function DelWidget({onClose, onDelete}: Prop) {

    return <>
    <Modal.Header onClose={onClose}>
        <span>¿Quieres eliminar este widget?</span>
    </Modal.Header>
    <Modal.Footer>
        <Button label="No, cancelar"/>
        <Button label="Si, eliminar" onClick={onDelete}/>
    </Modal.Footer>
    </>

}