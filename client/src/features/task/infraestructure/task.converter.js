/**
 * Reemplaza `mapDocumentToAnyTask`/`mapAnyTaskToDocument`: Firestore llama
 * `toFirestore` en `addDoc`/`setDoc` y `fromFirestore` en cada snapshot
 * (`getDoc`/`getDocs`/`onSnapshot`), así que una referencia con
 * `.withConverter(taskConverter)` ya lee y escribe `AnyTask` tipado sin un
 * mapper manual en el medio.
 *
 * `updateDoc()` sigue sin pasar por acá (ver `withoutId.ts`) — es una
 * limitación de la Web SDK, no de esta conversión.
 *
 * De paso: el mapper viejo SIEMPRE devolvía la forma de `Task`
 * (title/progress/phase/...), incluso para un documento que en realidad
 * era un `NodeTask` (perdía `subTaskId` en silencio). Ahora si el
 * documento no tiene `progress` pero sí `subTaskId`, se reconstruye como
 * `NodeTask` de verdad.
 */
export const taskConverter = {
    toFirestore(task) {
        const { id: _id, ...data } = task;
        return data;
    },
    fromFirestore(snapshot, options) {
        const data = snapshot.data(options);
        if (data.subTaskId !== undefined) {
            return {
                id: snapshot.id,
                title: data.title,
                openAt: data.openAt ?? null,
                endAt: data.endAt,
                createdAt: data.createdAt,
                updatedAt: data.updatedAt,
                subTaskId: data.subTaskId,
            };
        }
        return {
            id: snapshot.id,
            title: data.title,
            openAt: data.openAt ?? null,
            endAt: data.endAt,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
            progress: data.progress,
            phase: data.phase,
            submission: data.submission ?? null,
        };
    },
};
