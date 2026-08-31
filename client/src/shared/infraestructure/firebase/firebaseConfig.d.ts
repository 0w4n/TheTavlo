import { type Auth } from "firebase/auth";
import { Firestore } from "firebase/firestore";
declare class FirebaseService {
    private app;
    private _auth;
    private _firestore;
    constructor();
    get auth(): Auth;
    get firestore(): Firestore;
}
export declare const firebaseService: FirebaseService;
export {};
