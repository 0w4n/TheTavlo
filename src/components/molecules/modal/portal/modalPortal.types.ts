import type { ReactNode } from "react";

export interface ModalPortalProps {
  className?: string;

  iconName: string;

  label?: string;

  children: (onClose: () => void) => ReactNode;
}
