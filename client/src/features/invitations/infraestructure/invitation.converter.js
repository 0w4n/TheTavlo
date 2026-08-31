/**
 * Igual que el código que reemplaza (`{ id, ...doc.data() } as Invitation`):
 * no discrimina entre `ChownInvitation`/`ChmodInvitation`/`ShareInvitation`,
 * devuelve siempre la forma base `Invitation`. Si algún caller necesita el
 * tipo específico, ya lo estrecha él mismo con los type guards de
 * `invitation.entity.ts` (`isChownInvitation`, etc.) — no es una regresión,
 * es el mismo comportamiento de antes.
 */
export const invitationConverter = {
    toFirestore(invitation) {
        const { id: _id, ...data } = invitation;
        return data;
    },
    fromFirestore(snapshot, options) {
        return { id: snapshot.id, ...snapshot.data(options) };
    },
};
/** `SharedUser` no tiene `id` propio (su id de documento ES `userId`), así que no hay nada que sacar antes de escribir. */
export const sharedUserConverter = {
    toFirestore(sharedUser) {
        return sharedUser;
    },
    fromFirestore(snapshot, options) {
        return snapshot.data(options);
    },
};
