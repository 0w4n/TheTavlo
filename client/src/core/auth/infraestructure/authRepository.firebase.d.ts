import { type Auth } from "firebase/auth";
import type { GoogleUser, GuestUser, User } from "../domain/user.entity";
import type { AuthRepository } from "../app/authRepository.interface";
export declare class FirebaseAuthRepository implements AuthRepository {
    private auth;
    private googleProvider;
    constructor(auth: Auth);
    private mapFirebaseUser;
    signInAnonymously(): Promise<GuestUser>;
    signInWithGoogle(): Promise<GoogleUser>;
    linkGoogleAccount(): Promise<GoogleUser>;
    getCurrentUser(): User | null;
    onAuthStateChanged(callback: (user: User | null) => void): () => void;
    signOut(): Promise<void>;
}
