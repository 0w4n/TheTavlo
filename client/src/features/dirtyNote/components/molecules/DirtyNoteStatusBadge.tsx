import Icon from "#shared/ui/atoms/icons";
import type { DirtyNoteStatus } from "#features/dirtyNote/domain/DirtyNote.entity";
import { DIRTY_NOTE_STATUS_META } from "./dirtyNoteStatus.meta";

import "./dirtyNoteStatus.css";

export function DirtyNoteStatusBadge({ status }: { status: DirtyNoteStatus }) {
  const meta = DIRTY_NOTE_STATUS_META[status];

  return (
    <span className={`dirty-note-badge dirty-note-status--${meta.modifier}`}>
      <span aria-hidden="true" className="dirty-note-badge__icon">
        <Icon name={meta.icon} size={14} />
      </span>
      {meta.label}
    </span>
  );
}
