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

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  // Algunos hosts (Render, Vercel, etc.) no permiten saltos de línea reales
  // en variables de entorno — llegan como "\n" literal y hay que revertirlo.
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Faltan variables de entorno de Firebase Admin: FIREBASE_PROJECT_ID, " +
        "FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY. Revisa example.env.",
    );
  }

  return initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
}

export const firebaseApp = buildApp();
export const adminAuth = getAuth(firebaseApp);
export const adminDb = getFirestore(firebaseApp);
