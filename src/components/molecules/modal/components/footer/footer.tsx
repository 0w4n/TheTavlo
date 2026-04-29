import type { ModalFooterProps } from "./footer.types";

import "./footer.css";

export function ModalFooter({ children, className = "", ...props }: ModalFooterProps) {
  return (
    <div className={`modal__footer ${className}`} {...props}>
      {children}
    </div>
  );
}
