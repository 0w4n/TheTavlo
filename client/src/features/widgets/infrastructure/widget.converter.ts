import type {
  DocumentData,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  SnapshotOptions,
  WithFieldValue,
} from "firebase/firestore";
import type { Widget } from "../domain/widget.entity";

export const widgetConverter: FirestoreDataConverter<Widget> = {
  toFirestore(widget: WithFieldValue<Widget>): DocumentData {
    const { id: _id, ...data } = widget as Widget;
    return data;
  },

  fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): Widget {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      type: data.type,
      config: data.config ?? {},
      locked: data.locked ?? false,
      layout: data.layout,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  },
};
