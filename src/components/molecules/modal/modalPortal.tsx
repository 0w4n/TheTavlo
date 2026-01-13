import { useState } from "react";
import type { ModalPortalProps } from "./modal.types";
import { Button } from "#components/atoms/button";
import Icon from "#shared/ui/atoms/icons";
import { createPortal } from "react-dom";

export default function ModalPortal({
  iconName,
  className,
  children,
}: ModalPortalProps) {
  const [showModal, setShowModal] = useState(false);

  const onClose = () => setShowModal(false);

  return (
    <>
      <Button
        className={className}
        variant="primary"
        onClick={() => setShowModal(true)}
      >
        <Icon name={iconName} size={18}/>
      </Button>

      {showModal && createPortal(children(onClose), document.body)}
    </>
  );
}
