import { Button } from "#components/atoms/button";
import {
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "#components/molecules/modal";
import { useState } from "react";
import type { AddEventProps } from "./AddEvent.type";

export default function AddEvent({ type }: AddEventProps) {
    const [event, setEvent] = useState();
  return (
    <>
      <ModalHeader
        onClose={() => {}}
        title={`Agregar ${type}`}
      />
      <ModalBody>
        <div><p>Poner Evento</p></div>
      </ModalBody>
      <ModalFooter>
        <Button variant="secondary" title="Cancelar" icon="IconX" onClick={() => {}} />
        <Button variant="primary" title="Guardar" icon="IconSave" onClick={() => {}} />
      </ModalFooter>
    </>
  );
}


