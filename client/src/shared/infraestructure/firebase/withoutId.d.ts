/**
 * `updateDoc()` de la Web SDK de Firestore NO pasa por
 * `FirestoreDataConverter.toFirestore()` — solo `setDoc`/`addDoc` (vía
 * `getDoc`/`getDocs`/`onSnapshot` en lectura). Para actualizaciones
 * parciales, Firestore espera `UpdateData<T>` tal cual (para soportar
 * `FieldValue`/dot-notation), así que igual hay que sacar `id` a mano
 * antes de mandarlo — este es el único resto de "mapeo manual" que
 * `.withConverter()` no elimina.
 */
export declare function withoutId<T extends object>(value: T): Omit<T, "id">;
