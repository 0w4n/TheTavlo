import type {
  DocumentData,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  SnapshotOptions,
  WithFieldValue,
} from "firebase/firestore";
import { Timestamp } from "firebase/firestore";
import type { AccountType } from "#core/auth/domain/user.entity";
import type { Panel } from "../domain/panel.entity";

/**
 * Reemplaza `mapDocumentToPanel` + `ownerFromPath`. El mapper viejo
 * necesitaba que el CALLER le pasara `{ownerId, ownerAccountType}` a mano
 * en cada uno de sus ~10 call sites (salvo en `findByRef`/`findBySharedId`,
 * que ya lo derivaban de `docSnap.ref.path`). Acá se deriva SIEMPRE del
 * path del propio documento (`snapshot.ref.path` = "{accountType}/{ownerId}/panels/{id}"),
 * que es exactamente lo mismo que un query contra tu propia colección
 * también te da — así que no se pierde nada, y se deja de tener que
 * acordarse de pasar `owner` en cada método nuevo.
 */
export const panelConverter: FirestoreDataConverter<Panel> = {
  toFirestore(panel: WithFieldValue<Panel>): DocumentData {
    const {
      id: _id,
      ownerId: _ownerId,
      ownerAccountType: _ownerAccountType,
      ...data
    } = panel as Panel;

    if (data.createdAt instanceof Date) {
      data.createdAt = Timestamp.fromDate(data.createdAt);
    }
    if (data.updatedAt instanceof Date) {
      data.updatedAt = Timestamp.fromDate(data.updatedAt);
    }
    return data;
  },

  fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): Panel {
    const data = snapshot.data(options);
    const [ownerAccountType, ownerId] = snapshot.ref.path.split("/");

    return {
      id: snapshot.id,
      parentId: data.parentId ?? null,
      name: data.name,
      icon: data.icon,
      color: data.color,
      sharedWith: data.sharedWith ?? null,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      isArchived: data.isArchived,
      ownerId,
      ownerAccountType: ownerAccountType as AccountType,
    };
  },
};
