import { resolvePanelOwner } from "#core/globalContext/resolvePanelOwner";
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, Timestamp, updateDoc, } from "firebase/firestore";
import { withoutId } from "#shared/infraestructure/firebase/withoutId";
import { noteConverter } from "./note.converter";
export class FirebaseNoteRepository {
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
        const { panelId } = ctx.state.panel;
        if (panelId.length > 0) {
            const { accountType, ownerId } = resolvePanelOwner(ctx);
            return `${accountType}/${ownerId}/panels/${panelId}/notes`;
        }
        const { userId, accountType } = ctx.state.user;
        return `${accountType}/${userId}/panels`;
    }
    getContext() {
        const ctx = this.getCurrentContext();
        return ctx;
    }
    collectionRef() {
        return collection(this.firestore, this.getCollectionPath()).withConverter(noteConverter);
    }
    docRef(id) {
        return doc(this.firestore, this.getCollectionPath(), id).withConverter(noteConverter);
    }
    async findAll() {
        const snap = await getDocs(query(this.collectionRef()));
        return snap.docs.map((d) => d.data());
    }
    async findById(id) {
        // Antes: `query(collection(firestore, collPath, id))` — un
        // `collection()` con un número par de segmentos, inválido en
        // Firestore (tira "must have an odd number of segments" en runtime).
        // Buscar UN documento por id es `doc()` + `getDoc()`, no una query.
        const docSnap = await getDoc(this.docRef(id));
        return docSnap.exists() ? docSnap.data() : null;
    }
    async create(data) {
        const docRef = await addDoc(this.collectionRef(), data);
        return { ...data, id: docRef.id };
    }
    async update(id, data) {
        const now = Timestamp.now();
        const updateData = withoutId({ ...data, updatedAt: now });
        // updateDoc no pasa por el converter (ver withoutId.ts), pero igual
        // acepta una referencia convertida sin problema.
        await updateDoc(this.docRef(id), updateData);
        return { id, ...updateData };
    }
    async delete(id) {
        await deleteDoc(this.docRef(id));
    }
}
