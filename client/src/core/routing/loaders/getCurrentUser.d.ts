import { type Auth } from "firebase/auth";
import type { User } from "#core/auth/domain/user.entity";
/**
 * Espera a que Firebase Auth resuelva el estado inicial (o el siguiente
 * cambio) y devuelve el usuario de dominio, o `null` si no hay sesión.
 *
 * Única implementación de este helper — antes estaba duplicado, casi
 * idéntico, en cada loader.
 */
export declare function getCurrentUser(auth: Auth): Promise<User | null>;
