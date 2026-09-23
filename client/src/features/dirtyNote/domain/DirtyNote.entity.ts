import type { Timestamp } from "firebase/firestore";

/**
 * Etiquetas de estado permitidas para una DirtyNote. El orden refleja su
 * "madurez": de un borrador rápido a una versión cerrada.
 *
 * Son valores persistidos en Firestore tal cual (con espacios y en
 * minúsculas), así que NO se deben renombrar sin migrar los datos.
 */
export const DIRTY_NOTE_STATUSES = ["sucio", "en progreso", "final"] as const;

export type DirtyNoteStatus = (typeof DIRTY_NOTE_STATUSES)[number];

/**
 * Documento en `{accountType}/{ownerId}/panels/{panelId}/dirtyNote/{id}`.
 */
export interface DirtyNote {
  id: string;
  /** Nombre de la DirtyNote. También es el nombre de los archivos exportados. */
  title: string;
  /** Contenido en Markdown (se guarda tal cual lo escribe el usuario). */
  content: string;
  status: DirtyNoteStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/** Lo que el usuario decide al crear; ids y timestamps los pone el repositorio. */
export type CreateDirtyNoteDTO = Pick<
  DirtyNote,
  "title" | "content" | "status"
>;

export type UpdateDirtyNoteDTO = Partial<CreateDirtyNoteDTO>;

/**
 * Resultado de una actualización parcial: solo lo que cambió, más el
 * `updatedAt` que fijó el repositorio. Es intencionalmente NO un
 * `DirtyNote` completo — hacer un cast a `DirtyNote` aquí (como hacían
 * otros repositorios) llevaba a reemplazar el estado con un objeto al que
 * le faltaban campos.
 */
export type DirtyNoteChanges = Pick<DirtyNote, "id" | "updatedAt"> &
  UpdateDirtyNoteDTO;
