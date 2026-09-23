import { useId } from "react";
import Icon from "#shared/ui/atoms/icons";
import {
  DIRTY_NOTE_STATUSES,
  type DirtyNoteStatus,
} from "#features/dirtyNote/domain/DirtyNote.entity";
import { DIRTY_NOTE_STATUS_META } from "./dirtyNoteStatus.meta";

import "./dirtyNoteStatus.css";

interface DirtyNoteStatusPickerProps {
  value: DirtyNoteStatus;
  onChange: (status: DirtyNoteStatus) => void;
  disabled?: boolean;
}

/**
 * Selector de estado: grupo de radios nativos (flechas para moverse, Tab para
 * entrar/salir del grupo) con aspecto de botones. Los radios nativos dan
 * gratis el teclado y los lectores de pantalla; el input queda oculto solo
 * visualmente.
 */
export function DirtyNoteStatusPicker({
  value,
  onChange,
  disabled = false,
}: DirtyNoteStatusPickerProps) {
  const groupId = useId();

  return (
    <fieldset className="dirty-note-status-picker" disabled={disabled}>
      <legend className="dirty-note-status-picker__legend">Estado</legend>
      <div className="dirty-note-status-picker__options">
        {DIRTY_NOTE_STATUSES.map((status) => {
          const meta = DIRTY_NOTE_STATUS_META[status];
          const inputId = `${groupId}-${meta.modifier}`;

          return (
            <div
              key={status}
              className={`dirty-note-status-picker__option dirty-note-status--${meta.modifier}`}
            >
              <input
                id={inputId}
                type="radio"
                name={groupId}
                value={status}
                checked={value === status}
                onChange={() => onChange(status)}
                className="dirty-note-status-picker__input"
              />
              <label htmlFor={inputId} className="dirty-note-status-picker__label">
                <span aria-hidden="true">
                  <Icon name={meta.icon} size={18} />
                </span>
                <span>{meta.label}</span>
              </label>
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}
