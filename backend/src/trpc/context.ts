import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { adminAuth, adminDb, firebaseApp } from "../firebase/config.js";

export interface AuthedUser {
  uid: string;
  email: string | null;
  /** true si es una sesión anónima de Firebase Auth (invitado sin cuenta). */
  isAnonymous: boolean;
}

export interface Context {
  user: AuthedUser | null;
  db: FirebaseFirestore.Firestore;
}

/**
 * El cliente manda `Authorization: Bearer <idToken>` (el ID token que ya
 * obtiene del SDK de Firebase Auth con `getIdToken()`). Si falta o es
 * inválido, `user` queda en `null` — algunos procedures (resolveAccess)
 * deben poder llamarse sin sesión, así que NO lanzamos aquí; cada
 * procedure decide si exige `ctx.user` (ver `protectedProcedure`).
 */
export async function createContext({ req }: CreateExpressContextOptions): Promise<Context> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return { user: null, db: adminDb };

  const idToken = authHeader.slice("Bearer ".length).trim();
  if (!idToken) return { user: null, db: adminDb };
  try {
    const decoded = await adminAuth.verifyIdToken(idToken);
    return {
      user: {
        uid: decoded.uid,
        email: decoded.email ?? null,
        isAnonymous: decoded.firebase.sign_in_provider === "anonymous",
      },
      db: adminDb,
    };
  } catch (error) {
    const verificationError = error as { code?: string; message?: string };
    console.error("No se pudo verificar el token de Firebase", {
      code: verificationError.code ?? "unknown",
      message: verificationError.message ?? "unknown",
      projectId: firebaseApp.options.projectId ?? "unknown",
    });
    return { user: null, db: adminDb };
  }
}
