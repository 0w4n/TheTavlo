import type {
  DocumentData,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  SnapshotOptions,
  WithFieldValue,
} from "firebase/firestore";
import type { Note } from "../domain/note.entity";

export const noteConverter: FirestoreDataConverter<Note> = {
  toFirestore(note: WithFieldValue<Note>): DocumentData {
    const { id: _id, ...data } = note as Note;
    return data;
  },

  fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): Note {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      title: data.title,
      body: data.body,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  },
};
