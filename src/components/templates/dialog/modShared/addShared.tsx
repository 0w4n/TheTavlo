import { Modal } from "#components/molecules/modal";
import { Button } from "#components/atoms/button";
import { Input } from "#components/atoms/input/input";
import type { AddSharedProps } from "./addShared.type";
import { useState, type ChangeEvent } from "react";
import useInvitation from "#features/invitations/presentation/hooks/useInvitation";
import useGlobalContext from "#core/globalContext/hooks/useGlobalContext";
import {
  InvitationStatus,
  type CreatedSharedUserDTO,
  type UserRole,
} from "#features/invitations/domain/invitation.entity";

import "./addShared.css";

export default function AddShared({ type, onClose }: AddSharedProps) {
  const { createInvitation } = useInvitation();
  const { state } = useGlobalContext();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("editor");

  const handleSubmit = () => {
    const currentPanelId = state.panel.panelId;
    const currentUserId = state.user.userId;

    const sharedUserMap = new Map<number, CreatedSharedUserDTO>();
    sharedUserMap.set(0, { userId: email, role: role as UserRole, status: InvitationStatus.PENDING});

    const returnedInvitation = createInvitation(
      { ownerId: currentUserId, sharedUser: sharedUserMap },
      currentPanelId,
    );

    console.log(returnedInvitation);

    onClose();
  };

  return (
    <>
      <Modal.Header onClose={onClose} icon="IconShare">
        <span>Compartir {type}</span>
      </Modal.Header>
      <Modal.Body>
        <form onSubmit={handleSubmit} className="add-shared__form">
          <Input
            variant="default"
            label="Correo electrónico"
            placeholder="Ingrese el correo electrónico"
            leftIcon="IconAt"
            value={email}
            onChange={(e: ChangeEvent<HTMLInputElement, HTMLInputElement>) => setEmail(e.target.value)}
          />
          <select
            className="add-shared__select"
            defaultValue="editor"
            onChange={(e: ChangeEvent<HTMLSelectElement, HTMLSelectElement>) => setRole(e.target.value)}
          >
            <option value="editor">Editor</option>
            <option value="viewer">Viewer</option>
          </select>
        </form>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={onClose} variant="ghost" label="Cancelar" />
        <Button onClick={handleSubmit} variant="primary" label="Guardar" />
      </Modal.Footer>
    </>
  );
}
