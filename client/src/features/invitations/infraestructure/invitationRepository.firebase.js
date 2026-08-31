import { collection, doc, getDoc, getDocs, query, where, writeBatch, setDoc, Timestamp, } from "firebase/firestore";
import { invitationConverter, sharedUserConverter } from "./invitation.converter";
export class FirebaseInvitationRepository {
    constructor(firestore, getCurrentContext) {
        Object.defineProperty(this, "firestore", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: firestore
        });
        Object.defineProperty(this, "getCurrentContext", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: getCurrentContext
        });
    }
    getCollectionPath() {
        return "shared";
    }
    getContext() {
        const ctx = this.getCurrentContext();
        if (!ctx) {
            throw new Error("GlobalContext no disponible");
        }
        return ctx;
    }
    collectionRef() {
        return collection(this.firestore, this.getCollectionPath()).withConverter(invitationConverter);
    }
    docRef(id) {
        return doc(this.firestore, this.getCollectionPath(), id).withConverter(invitationConverter);
    }
    async findByToken(token) {
        const q = query(this.collectionRef(), where("token", "==", token));
        return getDocs(q)
            .then((snapshot) => snapshot.docs[0]?.data())
            .catch((e) => {
            throw new Error(`Error fetching invitation by token: ${e.message}`);
        });
    }
    async create(data, parentRef) {
        // OJO: "users" (plural) — antes decía "user" y la búsqueda del panel
        // padre fallaba siempre. Además usamos el accountType real del
        // propietario (puede ser un "guest" compartiendo su propio panel),
        // en vez de asumir siempre "users".
        const { userId, accountType } = this.getContext().state.user;
        const parentDocRef = doc(this.firestore, `${accountType}/${userId}/panels/${parentRef}`);
        const parentSnap = await getDoc(parentDocRef);
        if (!parentSnap.exists()) {
            throw new Error(`Panel padre con id "${parentRef}" no encontrado`);
        }
        const newDocRef = doc(this.collectionRef()); // ← ref nueva, ya tipada
        const payload = {
            ...data,
            // targetRef se fija aquí, en servidor/cliente de confianza, en vez de
            // confiar en lo que mande el llamador — siempre debe apuntar al panel
            // que se acaba de validar arriba.
            targetRef: parentDocRef,
        };
        const batch = writeBatch(this.firestore);
        batch.set(newDocRef, payload);
        await batch.commit();
        // También dejamos constancia en el propio panel para que
        // findBySharedId (collectionGroup) pueda encontrarlo por su id.
        await writeBatch(this.firestore)
            .update(parentDocRef, { sharedWith: newDocRef.id })
            .commit();
        return { ...payload, id: newDocRef.id };
    }
    async update(id, data) {
        const docRef = this.docRef(id);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
            throw new Error(`Invitación con id "${id}" no encontrada`);
        }
        const updateData = { ...data, updatedAt: Timestamp.now() };
        const batch = writeBatch(this.firestore);
        batch.update(docRef, updateData);
        await batch.commit();
        return { ...docSnap.data(), ...updateData, id };
    }
    async delete(token) {
        const q = query(this.collectionRef(), where("token", "==", token));
        const snapshot = await getDocs(q);
        if (snapshot.empty) {
            throw new Error(`Invitación con token "${token}" no encontrada`);
        }
        const batch = writeBatch(this.firestore);
        snapshot.forEach((doc) => {
            batch.delete(doc.ref);
        });
        await batch.commit();
    }
    // ─── Sub-colección invitedUsers ───────────────────────────────────────────
    // path: shared/{invitationId}/invitedUsers/{userId}
    invitedUsersCollectionPath(invitationId) {
        return `${this.getCollectionPath()}/${invitationId}/invitedUsers`;
    }
    invitedUsersCollectionRef(invitationId) {
        return collection(this.firestore, this.invitedUsersCollectionPath(invitationId)).withConverter(sharedUserConverter);
    }
    invitedUserDocRef(invitationId, userId) {
        return doc(this.firestore, this.invitedUsersCollectionPath(invitationId), userId).withConverter(sharedUserConverter);
    }
    async findSharedUser(invitationId, userId) {
        const snap = await getDoc(this.invitedUserDocRef(invitationId, userId));
        return snap.exists() ? snap.data() : undefined;
    }
    async listSharedUsers(invitationId) {
        const snap = await getDocs(this.invitedUsersCollectionRef(invitationId));
        return snap.docs.map((d) => d.data());
    }
    async upsertSharedUser(invitationId, data) {
        const docRef = this.invitedUserDocRef(invitationId, data.userId);
        const existing = await getDoc(docRef);
        const now = Timestamp.now();
        const payload = {
            ...data,
            createdAt: existing.exists() ? existing.data().createdAt : now,
            updatedAt: now,
            statusUpdatedAt: now,
        };
        await setDoc(docRef, payload, { merge: true });
        return payload;
    }
}
