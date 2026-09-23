import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.CLIENT_FIREBASE_API_KEY,
  authDomain: import.meta.env.CLIENT_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.CLIENT_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.CLIENT_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.CLIENT_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.CLIENT_FIREBASE_APP_ID,
};

console.log(firebaseConfig);

class FirebaseService {
  private app: FirebaseApp;
  private _auth: Auth;
  private _firestore: Firestore;

  constructor() {
    this.app = initializeApp(firebaseConfig);
    this._auth = getAuth(this.app);
    this._firestore = getFirestore(this.app);
  }

  get auth(): Auth {
    return this._auth;
  }

  get firestore(): Firestore {
    return this._firestore;
  }
}

export const firebaseService = new FirebaseService();
