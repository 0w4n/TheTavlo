import {
  Timestamp,
  type DocumentData,
  type FirestoreDataConverter,
  type QueryDocumentSnapshot,
  type SnapshotOptions,
  type WithFieldValue,
} from "firebase/firestore";
import type { DirtyNote } from "../domain/DirtyNote.entity";
import { DirtyNoteRules } from "../domain/DirtyNote.rules";

/**
 * Convierte entre el documento de Firestore y `DirtyNote`.
 *
 * La lectura es defensiva a propósito: el documento puede haberlo escrito
 * otro cliente (o a mano desde la consola), así que un `status` inválido cae
 * a "sucio" y un campo de texto ausente a "" en vez de romper la lista.
 */
export const dirtyNoteConverter: FirestoreDataConverter<DirtyNote> = {
  toFirestore(dirtyNote: WithFieldValue<DirtyNote>): DocumentData {
    // Lista blanca explícita: `id` vive en la ruta, no dentro del documento.
    return {
      title: dirtyNote.title,
      content: dirtyNote.content,
      status: dirtyNote.status,
      createdAt: dirtyNote.createdAt,
      updatedAt: dirtyNote.updatedAt,
    };
  },

  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions,
  ): DirtyNote {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      title: typeof data.title === "string" ? data.title : "",
      content: typeof data.content === "string" ? data.content : "",
      status: DirtyNoteRules.toStatus(data.status),
      createdAt:
        data.createdAt instanceof Timestamp
          ? data.createdAt
          : Timestamp.fromMillis(0),
      updatedAt:
        data.updatedAt instanceof Timestamp
          ? data.updatedAt
          : Timestamp.fromMillis(0),
    };
  },
};
