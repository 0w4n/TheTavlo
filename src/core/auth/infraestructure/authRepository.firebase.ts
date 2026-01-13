import {
  signInAnonymously as firebaseSignInAnonymously,
  signInWithPopup,
  GoogleAuthProvider,
  linkWithPopup,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  signOut as firebaseSignOut,
  type User as FirebaseUser,
  type Auth,
} from "firebase/auth";
import type { GoogleUser, GuestUser, User } from "../domain/user.entity";
import type { AuthRepository } from "../app/authRepository.interface";

export class FirebaseAuthRepository implements AuthRepository {
  private googleProvider: GoogleAuthProvider;

  constructor(private auth: Auth) {
    this.googleProvider = new GoogleAuthProvider();
    this.googleProvider.setCustomParameters({
      prompt: "select_account",
    });
  }

  private mapFirebaseUser(firebaseUser: FirebaseUser): User {
    const isAnonymous = firebaseUser.isAnonymous;

    const baseUser = {
      id: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      createdAt: new Date(firebaseUser.metadata.creationTime!),
    };

    if (isAnonymous) {
      return {
        ...baseUser,
        accountType: "guests" as const,
        guestId: firebaseUser.uid,
      } as GuestUser;
    } else {
      return {
        ...baseUser,
        accountType: "users" as const,
        email: firebaseUser.email!,
      } as GoogleUser;
    }
  }

  async signInAnonymously(): Promise<GuestUser> {
    const userCredential = await firebaseSignInAnonymously(this.auth);
    return this.mapFirebaseUser(userCredential.user) as GuestUser;
  }

  async signInWithGoogle(): Promise<GoogleUser> {
    try {
      const userCredential = await signInWithPopup(
        this.auth,
        this.googleProvider
      );
      return this.mapFirebaseUser(userCredential.user) as GoogleUser;
    } catch (error) {
      console.error("Google sign-in error:", error);
      throw error;
    }
  }

  async linkGoogleAccount(): Promise<GoogleUser> {
    const currentUser = this.auth.currentUser;
    if (!currentUser || !currentUser.isAnonymous) {
      throw new Error("No hay sesión de invitado activa");
    }

    const userCredential = await linkWithPopup(
      currentUser,
      this.googleProvider
    );
    return this.mapFirebaseUser(userCredential.user) as GoogleUser;
  }

  getCurrentUser(): User | undefined {
    const firebaseUser = this.auth.currentUser;
    return firebaseUser ? this.mapFirebaseUser(firebaseUser) : undefined;
  }

  onAuthStateChanged(callback: (user: User | undefined) => void): () => void {
    return firebaseOnAuthStateChanged(this.auth, (firebaseUser) => {
      callback(firebaseUser ? this.mapFirebaseUser(firebaseUser) : undefined);
    });
  }

  async signOut(): Promise<void> {
    await firebaseSignOut(this.auth);
  }
}
