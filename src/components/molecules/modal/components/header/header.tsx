import type { ModalHeaderProps } from "./header.types";
import Icon from "#shared/ui/atoms/icons";
import { Button } from "#components/atoms/button";

import "./header.css";

export function ModalHeader({
  children,
  className = "",
  onClose,
  icon,
  ...props
}: ModalHeaderProps) {
  return (
    <div className={`modal__header ${className}`} {...props}>
      <div className="modal__header--content">
        {icon && <Icon name={icon} />}
        {children}
      </div>

      <Button
        className="modal__close-button"
        onClick={() => onClose(false)}
        aria-label="Cerrar modal"
        type="button"
        icon="IconX"
      />
    </div>
  );
}
