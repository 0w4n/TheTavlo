import type { FirestoreDataConverter } from "firebase/firestore";
import type { Invitation, SharedUser } from "../domain/invitation.entity";
/**
 * Igual que el código que reemplaza (`{ id, ...doc.data() } as Invitation`):
 * no discrimina entre `ChownInvitation`/`ChmodInvitation`/`ShareInvitation`,
 * devuelve siempre la forma base `Invitation`. Si algún caller necesita el
 * tipo específico, ya lo estrecha él mismo con los type guards de
 * `invitation.entity.ts` (`isChownInvitation`, etc.) — no es una regresión,
 * es el mismo comportamiento de antes.
 */
export declare const invitationConverter: FirestoreDataConverter<Invitation>;
/** `SharedUser` no tiene `id` propio (su id de documento ES `userId`), así que no hay nada que sacar antes de escribir. */
export declare const sharedUserConverter: FirestoreDataConverter<SharedUser>;
