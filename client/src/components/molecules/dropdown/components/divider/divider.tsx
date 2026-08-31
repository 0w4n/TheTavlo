import type { DropdownDividerProps } from "./divider.types";

import "./divider.css";

export function DropdownDivider({ label }: DropdownDividerProps) {
  if (label) {
    return (
      <div className="dropdown__divider dropdown__divider--with-label">
        <span className="dropdown__divider-label">{label}</span>
      </div>
    );
  }

  return <div className="dropdown__divider" role="separator" />;
}
