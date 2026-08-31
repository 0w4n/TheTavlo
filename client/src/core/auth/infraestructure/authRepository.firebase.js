import { signInAnonymously as firebaseSignInAnonymously, signInWithPopup, GoogleAuthProvider, linkWithPopup, onAuthStateChanged as firebaseOnAuthStateChanged, signOut as firebaseSignOut, } from "firebase/auth";
export class FirebaseAuthRepository {
    constructor(auth) {
        Object.defineProperty(this, "auth", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: auth
        });
        Object.defineProperty(this, "googleProvider", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.googleProvider = new GoogleAuthProvider();
        this.googleProvider.setCustomParameters({
            prompt: "select_account",
        });
    }
    mapFirebaseUser(firebaseUser) {
        const isAnonymous = firebaseUser.isAnonymous;
        const baseUser = {
            id: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            createdAt: new Date(firebaseUser.metadata.creationTime),
        };
        if (isAnonymous) {
            return {
                ...baseUser,
                accountType: "guests",
                guestId: firebaseUser.uid,
            };
        }
        else {
            return {
                ...baseUser,
                accountType: "users",
                email: firebaseUser.email,
            };
        }
    }
    async signInAnonymously() {
        const userCredential = await firebaseSignInAnonymously(this.auth);
        return this.mapFirebaseUser(userCredential.user);
    }
    async signInWithGoogle() {
        try {
            const userCredential = await signInWithPopup(this.auth, this.googleProvider);
            return this.mapFirebaseUser(userCredential.user);
        }
        catch (error) {
            console.error("Google sign-in error:", error);
            throw error;
        }
    }
    async linkGoogleAccount() {
        const currentUser = this.auth.currentUser;
        if (!currentUser || !currentUser.isAnonymous) {
            throw new Error("No hay sesión de invitado activa");
        }
        const userCredential = await linkWithPopup(currentUser, this.googleProvider);
        return this.mapFirebaseUser(userCredential.user);
    }
    getCurrentUser() {
        const firebaseUser = this.auth.currentUser;
        return firebaseUser ? this.mapFirebaseUser(firebaseUser) : null;
    }
    onAuthStateChanged(callback) {
        return firebaseOnAuthStateChanged(this.auth, (firebaseUser) => {
            callback(firebaseUser ? this.mapFirebaseUser(firebaseUser) : null);
        });
    }
    async signOut() {
        await firebaseSignOut(this.auth);
    }
}
