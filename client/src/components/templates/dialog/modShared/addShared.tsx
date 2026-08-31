import { Modal } from "#components/molecules/modal";
import { Button } from "#components/atoms/button";
import { Input } from "#components/atoms/input/input";
import type { AddSharedProps } from "./addShared.type";
import { useState, type ChangeEvent } from "react";
import useGlobalContext from "#core/globalContext/hooks/useGlobalContext";
import { resolvePanelOwner } from "#core/globalContext/resolvePanelOwner";
import usePanels from "#features/panels/presentation/hooks/usePanels";
import {
  InvitationApiClient,
  UserRole,
} from "#features/invitations/infraestructure/invitationApiClient";

import "./addShared.css";

type Status =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "sent" }
  | { kind: "link"; url: string };

export default function AddShared({ type, onClose }: AddSharedProps) {
  const ctx = useGlobalContext();
  const { state: panelsState } = usePanels();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const isPublicLink = type === "public";
  const panelId = ctx.state.panel.panelId;
  const { ownerId, accountType: ownerAccountType } = resolvePanelOwner(ctx);
  const panelName =
    panelsState.status === "panel"
      ? panelsState.currentPanel.name || "este panel"
      : "este panel";

  const handleSubmit = async () => {
    if (status.kind === "loading") return;

    if (isPublicLink) {
      setStatus({ kind: "loading" });
      try {
        const { url } = await InvitationApiClient.createPublicLink({
          panelId,
          ownerId,
          ownerAccountType,
        });
        setStatus({ kind: "link", url });
      } catch (error) {
        setStatus({
          kind: "error",
          message:
            error instanceof Error
              ? error.message
              : "No se pudo generar el enlace.",
        });
      }
      return;
    }

    if (!email.trim()) {
      setStatus({ kind: "error", message: "Ingresa un correo electrónico." });
      return;
    }

    setStatus({ kind: "loading" });
    try {
      await InvitationApiClient.inviteByEmail({
        panelId,
        panelName,
        ownerId,
        ownerAccountType,
        email: email.trim(),
        role: UserRole.VIEWER,
      });
      setStatus({ kind: "sent" });
    } catch (error) {
      setStatus({
        kind: "error",
        message:
          error instanceof Error
            ? error.message
            : "No se pudo enviar la invitación.",
      });
    }
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard?.writeText(url);
  };

  const isBusy = status.kind === "loading";
  const isDone = status.kind === "sent" || status.kind === "link";

  return (
    <>
      <Modal.Header
        onClose={onClose}
        icon="IconShare"
        title={
          isPublicLink ? "Compartir públicamente" : "Compartir con usuario"
        }
      ></Modal.Header>
      <Modal.Body>
        <div className="add-shared__form">
          {isPublicLink ? (
            status.kind === "link" ? (
              <>
                <Input
                  variant="default"
                  label="Enlace"
                  leftIcon="IconLink"
                  value={status.url}
                  readOnly
                />
                <Button
                  onClick={() => handleCopyLink(status.url)}
                  variant="secondary"
                  label="Copiar enlace"
                />
              </>
            ) : (
              <p>
                Cualquier persona con el enlace va a poder ver este panel
                (sin poder editarlo).
              </p>
            )
          ) : status.kind === "sent" ? (
            <p>Invitación enviada a {email}.</p>
          ) : (
            <>
              <Input
                variant="default"
                label="Correo electrónico"
                placeholder="Ingrese el correo electrónico"
                leftIcon="IconAt"
                value={email}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setEmail(e.target.value)
                }
              />
              <p className="add-shared__hint">
                Va a poder ver este panel. Si ya tiene cuenta en TheTavlo le
                aparece de inmediato; si no, le mandamos un correo para que
                se una.
              </p>
            </>
          )}
          {status.kind === "error" && (
            <p className="add-shared__error">{status.message}</p>
          )}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={onClose} variant="ghost" label="Cancelar" />
        {!isDone && (
          <Button
            onClick={handleSubmit}
            variant="primary"
            disabled={isBusy}
            label={
              isBusy ? "Enviando..." : isPublicLink ? "Generar enlace" : "Invitar"
            }
          />
        )}
      </Modal.Footer>
    </>
  );
}
