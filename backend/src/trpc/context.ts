import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { adminAuth } from "../firebase/config.ts";

export interface AuthedUser {
  uid: string;
  email: string | null;
  /** true si es una sesión anónima de Firebase Auth (invitado sin cuenta). */
  isAnonymous: boolean;
}

export interface Context {
  user: AuthedUser | null;
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
  if (!authHeader?.startsWith("Bearer ")) return { user: null };

  const idToken = authHeader.slice("Bearer ".length);
  try {
    const decoded = await adminAuth.verifyIdToken(idToken);
    return {
      user: {
        uid: decoded.uid,
        email: decoded.email ?? null,
        isAnonymous: decoded.firebase.sign_in_provider === "anonymous",
      },
    };
  } catch {
    return { user: null };
  }
}
