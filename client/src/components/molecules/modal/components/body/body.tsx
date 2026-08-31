import type { ModalBodyProps } from "./body.types";

import "./body.css";

export function ModalBody({ children, className = "", ...props }: ModalBodyProps) {
  return (
    <div className={`modal__body ${className}`} {...props}>
      {children}
    </div>
  );
}
