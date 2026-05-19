import { useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "#components/atoms/button";
import { Modal } from "../modal";
import type { ModalPortalProps } from "./modalPortal.types";

/**
 * Modal component for dialogs and overlays
 *
 * @example
 * ```tsx
 * <ModalPortal iconName="IconLayoutGridAdd">
 *   {children}
 * </ModalPortal>
 * ```
 */
export default function ModalPortal({
  iconName,
  label,
  className,
  children,
}: ModalPortalProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        icon={iconName}
        label={label}
        className={className}
      />

      {open &&
        createPortal(
          <Modal onClose={(open) => setOpen(open)} size="full">
            {children(() => setOpen(false))}
          </Modal>,
          document.body,
        )}
    </>
  );
}
