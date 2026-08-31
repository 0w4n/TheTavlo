import { onAuthStateChanged, } from "firebase/auth";
/**
 * Mismo mapeo que `FirebaseAuthRepository.mapFirebaseUser`, pero sin
 * depender de una instancia de esa clase (los loaders corren fuera de React,
 * no tienen acceso a los servicios armados por los providers).
 *
 * TODO: `panelIdHome` no está disponible en el token de Firebase Auth; si un
 * loader lo necesita, debe resolverse aparte contra Firestore.
 */
function mapFirebaseUser(firebaseUser) {
    const base = {
        id: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        createdAt: new Date(firebaseUser.metadata.creationTime ?? Date.now()),
        panelIdHome: "",
    };
    return firebaseUser.isAnonymous
        ? { ...base, accountType: "guests", guestId: firebaseUser.uid }
        : { ...base, accountType: "users" };
}
/**
 * Espera a que Firebase Auth resuelva el estado inicial (o el siguiente
 * cambio) y devuelve el usuario de dominio, o `null` si no hay sesión.
 *
 * Única implementación de este helper — antes estaba duplicado, casi
 * idéntico, en cada loader.
 */
export function getCurrentUser(auth) {
    return new Promise((resolve, reject) => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            unsubscribe();
            resolve(firebaseUser ? mapFirebaseUser(firebaseUser) : null);
        }, reject);
    });
}
