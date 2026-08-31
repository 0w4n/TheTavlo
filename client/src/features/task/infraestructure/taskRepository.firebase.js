import { collection, doc, addDoc, getDoc, getDocs, query, Timestamp, updateDoc, deleteDoc, onSnapshot, } from "firebase/firestore";
import { resolvePanelOwner } from "#core/globalContext/resolvePanelOwner";
import { firebaseErr } from "#core/appCore/domain/AppCore.type";
import { withoutId } from "#shared/infraestructure/firebase/withoutId";
import { taskConverter } from "./task.converter";
export class FirebaseTaskRepository {
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
            return `${accountType}/${ownerId}/panels/${panelId}/tasks`;
        }
        // Sin panel activo: solo puede referirse a los paneles propios del
        // usuario actual (nunca a los de un dueño ajeno).
        const { userId, accountType } = ctx.state.user;
        return `${accountType}/${userId}/panels`;
    }
    getContext() {
        const ctx = this.getCurrentContext();
        return ctx;
    }
    collectionRef() {
        return collection(this.firestore, this.getCollectionPath()).withConverter(taskConverter);
    }
    docRef(id) {
        return doc(this.firestore, this.getCollectionPath(), id).withConverter(taskConverter);
    }
    // ─── Suscripción en tiempo real ───────────────────────────────────────────
    /**
     * Escucha las tareas del panel activo en tiempo real.
     * La primera emisión entrega todas las tareas actuales;
     * las siguientes reflejan creates, updates y deletes sin polling.
     */
    subscribe(onData, onError) {
        const q = query(this.collectionRef());
        return onSnapshot(q, (snap) => onData(snap.docs.map((d) => d.data())), (error) => onError(firebaseErr(error.message, error.code, error.stack)));
    }
    // ─── Queries puntuales ────────────────────────────────────────────────────
    async findAll() {
        const snap = await getDocs(query(this.collectionRef()));
        return snap.docs.map((d) => d.data());
    }
    async findById(id) {
        const docSnap = await getDoc(this.docRef(id));
        return docSnap.exists() ? docSnap.data() : null;
    }
    // ─── Mutaciones ───────────────────────────────────────────────────────────
    async create(data) {
        const now = Timestamp.now();
        const taskData = { ...data, createdAt: now, updatedAt: now };
        const docRef = await addDoc(this.collectionRef(), taskData);
        return { ...taskData, id: docRef.id };
    }
    async update(id, data) {
        const now = Timestamp.fromDate(new Date());
        const updateData = withoutId({ ...data, updatedAt: now });
        await updateDoc(this.docRef(id), updateData);
        return { id, ...updateData };
    }
    async delete(id) {
        await deleteDoc(this.docRef(id));
    }
}
