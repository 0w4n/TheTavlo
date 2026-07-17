import { Modal } from "#components/molecules/modal";
import { Button } from "#components/atoms/button";
import { Input } from "#components/atoms/input/input";
import type { AddSharedProps } from "./addShared.type";
import { useState, type ChangeEvent } from "react";
import useInvitation from "#features/invitations/presentation/hooks/useInvitation";
import useGlobalContext from "#core/globalContext/hooks/useGlobalContext";
import { InvitationType } from "#features/invitations/domain/invitation.entity";

import "./addShared.css";
import type { DocumentReference } from "firebase/firestore";

export default function AddShared({ type, onClose }: AddSharedProps) {
  const { createInvitation } = useInvitation();
  const { state } = useGlobalContext();
  const [email, setEmail] = useState("");

  const handleSubmit = () => {
    const currentPanelId = state.panel.panelId;
    const currentUserId = state.user.userId;

    const returnedInvitation = createInvitation(
      {
        createdBy: currentUserId,
        type: InvitationType.SHARE,
        targetRef: currentPanelId as unknown as DocumentReference,
        expiresAt: null,
      },
      currentPanelId,
    );

    console.log(returnedInvitation);

    onClose();
  };

  return (
    <>
      <Modal.Header
        onClose={onClose}
        icon="IconShare"
        title={
          type === "public" ? "Compartir públicamente" : "Compartir con usuario"
        }
      ></Modal.Header>
      <Modal.Body>
        <form onSubmit={handleSubmit} className="add-shared__form">
          <Input
            variant="default"
            label="Correo electrónico"
            placeholder="Ingrese el correo electrónico"
            leftIcon="IconAt"
            value={email}
            onChange={(e: ChangeEvent<HTMLInputElement, HTMLInputElement>) =>
              setEmail(e.target.value)
            }
          />
        </form>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={onClose} variant="ghost" label="Cancelar" />
        <Button onClick={handleSubmit} variant="primary" label="Guardar" />
      </Modal.Footer>
    </>
  );
}
