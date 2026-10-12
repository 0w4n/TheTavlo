import { useContext } from "react";
import type { ModalHeaderProps } from "./header.types";
import Icon from "#shared/ui/atoms/icons";
import { Button } from "#components/atoms/button";
import { ModalCloseContext } from "../../modal.context";

import "./header.css";

export function ModalHeader({
  className = "",
  onClose,
  title,
  icon,
  ...props
}: ModalHeaderProps) {
  // Si estamos dentro de un <Modal>, usamos su cierre animado
  // (fadeOut/scaleOut) en vez de desmontar en seco con el `onClose` directo.
  const requestClose = useContext(ModalCloseContext);
  const handleClose = () => (requestClose ? requestClose() : onClose(false));

  return (
    <div className={`modal__header ${className}`} {...props}>
      <div className="modal__header--content">
        {icon && <Icon name={icon} />}
        <span className="modal__header--content-title">{title}</span>
      </div>

      <Button
        className="modal__close-button"
        onClick={handleClose}
        aria-label="Cerrar modal"
        type="button"
        icon="IconX"
      />
    </div>
  );
}