import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import type { Analytics} from "firebase/analytics"

const firebaseConfig = {
  apiKey: import.meta.env.CLIENT_FIREBASE_API_KEY,
  authDomain: import.meta.env.CLIENT_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.CLIENT_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.CLIENT_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.CLIENT_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.CLIENT_FIREBASE_APP_ID,
  measurementId: import.meta.env.CLIENT_FIREBASE_MEASUREMENT_ID,
};

class FirebaseService {
  private app: FirebaseApp;
  private _auth?: Auth;
  private _firestore: Firestore;
  private _analytics?: Analytics;

  constructor() {
    this.app = initializeApp(firebaseConfig);
    this._firestore = getFirestore(this.app);
  }

  get auth(): Auth {
    this._auth ??= getAuth(this.app);
    return this._auth;
  }

  get firestore(): Firestore {
    return this._firestore;
  }
  
  async initAnalytics(): Promise<Analytics | undefined> {
    if (this._analytics) return this._analytics;
    const { getAnalytics, isSupported } = await import("firebase/analytics");
    if (!(await isSupported())) return undefined;
    this._analytics = getAnalytics(this.app);
    return this._analytics;
  }
}

export const firebaseService = new FirebaseService();
