import { initializeApp, cert, getApps, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

/**
 * Antes: `initializeApp({})` — sin credenciales, y este archivo no se
 * importaba desde ningún lado. `firebase-admin` necesita una service
 * account (o `applicationDefault()`) para poder verificar ID tokens y
 * escribir en Firestore con privilegios de servidor.
 */
function buildApp(): App {
  const existing = getApps();
  if (existing.length > 0) return existing[0]!;

  const credentials = process.env.FIREBASE_CRED;
  const databaseURL = process.env.FIREBASE_DATABASE_URL;

  if (!credentials) {
    throw new Error(
      "Faltan variables de entorno de Firebase Admin: FIREBASE_CRED. Revisa example.env.",
    );
  }
  if (!databaseURL) {
    throw new Error(
      "Faltan variables de entorno de Firebase Admin: DATABASE_URL. Revisa example.env.",
    );
  }

  const serviceAccount = JSON.parse(
    Buffer.from(credentials, 'base64').toString('utf-8')
  );

  return initializeApp({ credential: cert(serviceAccount), databaseURL });
}

export const firebaseApp = buildApp();
export const adminAuth = getAuth(firebaseApp);
export const adminDb = getFirestore(firebaseApp);
