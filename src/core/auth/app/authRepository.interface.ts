import type { User, GuestUser, GoogleUser } from "../domain/user.entity";

export interface AuthRepository {
  signInAnonymously(): Promise<GuestUser>;
  signInWithGoogle(): Promise<GoogleUser>;
  linkGoogleAccount(guestUser: GuestUser): Promise<GoogleUser>;
  getCurrentUser(): User | undefined;
  onAuthStateChanged(callback: (user: User | undefined) => void): () => void;
  signOut(): Promise<void>;
}
