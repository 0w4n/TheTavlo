import type { DirtyNoteStatus } from "#features/dirtyNote/domain/DirtyNote.entity";

export interface DirtyNoteStatusMeta {
  /** Texto visible. El valor persistido (`sucio`, `en progreso`, `final`) no cambia. */
  label: string;
  /** Ícono de Tabler: el estado nunca se comunica solo con color. */
  icon: string;
  description: string;
  /** Sufijo de clase CSS (sin espacios). */
  modifier: string;
}

export const DIRTY_NOTE_STATUS_META: Record<DirtyNoteStatus, DirtyNoteStatusMeta> = {
  sucio: {
    label: "Sucio",
    icon: "IconPencil",
    description: "Borrador rápido, sin ordenar",
    modifier: "sucio",
  },
  "en progreso": {
    label: "En progreso",
    icon: "IconLoader",
    description: "Se está trabajando en él",
    modifier: "en-progreso",
  },
  final: {
    label: "Final",
    icon: "IconCircleCheck",
    description: "Versión terminada",
    modifier: "final",
  },
};
