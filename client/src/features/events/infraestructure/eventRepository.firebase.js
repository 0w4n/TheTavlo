import { collection, getDocs, query, Timestamp, where, addDoc, doc, getDoc, updateDoc, deleteDoc, } from "firebase/firestore";
import { resolvePanelOwner } from "#core/globalContext/resolvePanelOwner";
import { withoutId } from "#shared/infraestructure/firebase/withoutId";
import { eventConverter } from "./event.converter";
export class FirebaseEventRepository {
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
        const ctx = this.getContext();
        const { accountType, ownerId } = resolvePanelOwner(ctx);
        const { panelId } = ctx.state.panel;
        return `${accountType}/${ownerId}/panels/${panelId}/event`;
    }
    getContext() {
        const ctx = this.getCurrentContext();
        if (!ctx) {
            throw new Error("GlobalContext no disponible");
        }
        return ctx;
    }
    collectionRef() {
        return collection(this.firestore, this.getCollectionPath()).withConverter(eventConverter);
    }
    docRef(id) {
        return doc(this.firestore, this.getCollectionPath(), id).withConverter(eventConverter);
    }
    async create(data) {
        const now = Timestamp.now();
        const payload = { ...data, createdAt: now, updatedAt: now };
        const docRef = await addDoc(this.collectionRef(), payload);
        return { ...payload, id: docRef.id };
    }
    // ⚠️ Sin cambios de comportamiento: sigue devolviendo solo exámenes
    // futuros, no "todos los eventos" (bug preexistente ya reportado en la
    // auditoría — no se toca en este cambio, que es solo mappers -> withConverter).
    async findAll() {
        const q = query(this.collectionRef(), where("type", "==", "exam"), where("makeAt", ">", Timestamp.now()));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map((doc) => doc.data());
    }
    async findById(id) {
        const docSnap = await getDoc(this.docRef(id));
        return docSnap.exists() ? docSnap.data() : undefined;
    }
    async update(id, data) {
        const now = Timestamp.now();
        const payload = withoutId({ ...data, updatedAt: now });
        await updateDoc(this.docRef(id), payload);
        return { id, ...payload };
    }
    async delete(id) {
        await deleteDoc(this.docRef(id));
    }
}
