import type { User, GuestUser, GoogleUser } from "../domain/user.entity";

export interface AuthRepository {
  signInAnonymously(): Promise<GuestUser>;
  signInWithGoogle(): Promise<{ user: GoogleUser; isNewUser: boolean }>;
  linkGoogleAccount(guestUser: GuestUser): Promise<GoogleUser>;
  getCurrentUser(): User | null;
  onAuthStateChanged(callback: (user: User | null) => void): () => void;
  signOut(): Promise<void>;
}
