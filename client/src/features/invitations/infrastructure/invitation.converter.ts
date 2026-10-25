import type {
  DocumentData,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  SnapshotOptions,
  WithFieldValue,
} from "firebase/firestore";
import type { Invitation, SharedUser } from "../domain/invitation.entity";

/**
 * Igual que el código que reemplaza (`{ id, ...doc.data() } as Invitation`):
 * no discrimina entre `ChownInvitation`/`ChmodInvitation`/`ShareInvitation`,
 * devuelve siempre la forma base `Invitation`. Si algún caller necesita el
 * tipo específico, ya lo estrecha él mismo con los type guards de
 * `invitation.entity.ts` (`isChownInvitation`, etc.) — no es una regresión,
 * es el mismo comportamiento de antes.
 */
export const invitationConverter: FirestoreDataConverter<Invitation> = {
  toFirestore(invitation: WithFieldValue<Invitation>): DocumentData {
    const { id: _id, ...data } = invitation as Invitation;
    return data;
  },
  fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): Invitation {
    return { id: snapshot.id, ...snapshot.data(options) } as Invitation;
  },
};

/** `SharedUser` no tiene `id` propio (su id de documento ES `userId`), así que no hay nada que sacar antes de escribir. */
export const sharedUserConverter: FirestoreDataConverter<SharedUser> = {
  toFirestore(sharedUser: WithFieldValue<SharedUser>): DocumentData {
    return sharedUser as DocumentData;
  },
  fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): SharedUser {
    return snapshot.data(options) as SharedUser;
  },
};
