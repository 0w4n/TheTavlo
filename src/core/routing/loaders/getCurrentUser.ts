import {
  onAuthStateChanged,
  type Auth,
  type User as FirebaseUser,
} from "firebase/auth";
import type { GoogleUser, GuestUser, User } from "#core/auth/domain/user.entity";

/**
 * Mismo mapeo que `FirebaseAuthRepository.mapFirebaseUser`, pero sin
 * depender de una instancia de esa clase (los loaders corren fuera de React,
 * no tienen acceso a los servicios armados por los providers).
 *
 * TODO: `panelIdHome` no está disponible en el token de Firebase Auth; si un
 * loader lo necesita, debe resolverse aparte contra Firestore.
 */
function mapFirebaseUser(firebaseUser: FirebaseUser): User {
  const base = {
    id: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
    createdAt: new Date(firebaseUser.metadata.creationTime ?? Date.now()),
    panelIdHome: "",
  };

  return firebaseUser.isAnonymous
    ? ({ ...base, accountType: "guests", guestId: firebaseUser.uid } as GuestUser)
    : ({ ...base, accountType: "users" } as GoogleUser);
}

/**
 * Espera a que Firebase Auth resuelva el estado inicial (o el siguiente
 * cambio) y devuelve el usuario de dominio, o `null` si no hay sesión.
 *
 * Única implementación de este helper — antes estaba duplicado, casi
 * idéntico, en cada loader.
 */
export function getCurrentUser(auth: Auth): Promise<User | null> {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        unsubscribe();
        resolve(firebaseUser ? mapFirebaseUser(firebaseUser) : null);
      },
      reject,
    );
  });
}
