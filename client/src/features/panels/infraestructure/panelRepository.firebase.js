import { collection, doc, getDocs, getDoc, updateDoc, deleteDoc, query, Timestamp, DocumentReference, Firestore, writeBatch, where, collectionGroup, onSnapshot, documentId, addDoc, deleteField, } from "firebase/firestore";
import { err, ok, firebaseErr, } from "#core/appCore/domain/AppCore.type";
import { withoutId } from "#shared/infraestructure/firebase/withoutId";
import { panelConverter } from "./panel.converter";
export class FirebasePanelsRepository {
    constructor(firestore, getCurrentUser) {
        Object.defineProperty(this, "firestore", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: firestore
        });
        Object.defineProperty(this, "getCurrentUser", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: getCurrentUser
        });
    }
    // ─── Helpers ─────────────────────────────────────────────────────────────
    getCollectionPath() {
        const { accountType, id } = this.getUser();
        return `${accountType}/${id}/panels`;
    }
    getUser() {
        const ctx = this.getCurrentUser();
        if (!ctx)
            throw new Error("panelUserContext no disponible");
        return ctx;
    }
    collectionRef() {
        return collection(this.firestore, this.getCollectionPath()).withConverter(panelConverter);
    }
    docRef(id) {
        return doc(this.firestore, this.getCollectionPath(), id).withConverter(panelConverter);
    }
    setPanelDefault() {
        const now = Timestamp.now();
        return {
            parentId: null,
            name: "",
            color: -1,
            icon: "",
            sharedWith: null,
            createdAt: now,
            updatedAt: now,
        };
    }
    // ─── Suscripciones en tiempo real ────────────────────────────────────────
    /**
     * Escucha el panel "home" en tiempo real.
     * Si no existe aún, lo crea y el listener se dispara automáticamente
     * con el nuevo documento.
     */
    subscribeToHomePanel(onData, onError) {
        const q = query(this.collectionRef(), where("color", "==", -1), where("parentId", "==", null));
        // Bandera para evitar creaciones paralelas si el listener dispara varias veces
        let creating = false;
        return onSnapshot(q, (snap) => {
            if (!snap.empty) {
                creating = false;
                onData(snap.docs[0].data());
                return;
            }
            // Panel no existe — crear por primera vez (solo una vez)
            if (!creating) {
                creating = true;
                this.create(this.setPanelDefault()).then((result) => {
                    if (!result.success) {
                        creating = false;
                        onError(result.err);
                    }
                    // Si tuvo éxito, el onSnapshot se dispara de nuevo con el nuevo doc
                });
            }
        }, (error) => onError(firebaseErr(error.message, error.code, error.stack)));
    }
    /**
     * Escucha todos los paneles del usuario en tiempo real.
     */
    subscribeToAll(onData, onError) {
        return onSnapshot(query(this.collectionRef()), (snap) => onData(snap.docs.map((d) => d.data())), (error) => onError(firebaseErr(error.message)));
    }
    // ─── Queries puntuales ────────────────────────────────────────────────────
    async findHomePanel() {
        const q = query(this.collectionRef(), where("color", "==", -1), where("icon", "==", ""), where("name", "==", ""), where("sharedWith", "==", null));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
            return this.create(this.setPanelDefault());
        }
        return ok(querySnapshot.docs[0].data());
    }
    async findAll() {
        const querySnapshot = await getDocs(query(this.collectionRef()));
        return ok(querySnapshot.docs.map((d) => d.data()));
    }
    async findByParentId(parentId) {
        const q = query(this.collectionRef(), where("parentId", "==", parentId));
        const querySnapshot = await getDocs(q);
        return ok(querySnapshot.docs.map((d) => d.data()));
    }
    async findById(id) {
        const docSnap = await getDoc(this.docRef(id));
        return ok(docSnap.exists() ? docSnap.data() : undefined);
    }
    /**
     * Trae varios paneles por id en el menor número de queries posible, en
     * vez de un `findById` por cada uno. Firestore limita el operador `in` a
     * 10 valores por query, así que agrupamos en chunks de a 10 y los
     * disparamos todos en paralelo.
     */
    async findManyByIds(ids) {
        const uniqueIds = Array.from(new Set(ids));
        if (uniqueIds.length === 0)
            return ok([]);
        const FIRESTORE_IN_LIMIT = 10;
        const chunks = [];
        for (let i = 0; i < uniqueIds.length; i += FIRESTORE_IN_LIMIT) {
            chunks.push(uniqueIds.slice(i, i + FIRESTORE_IN_LIMIT));
        }
        try {
            const snapshots = await Promise.all(chunks.map((chunk) => getDocs(query(this.collectionRef(), where(documentId(), "in", chunk)))));
            const panels = snapshots.flatMap((snap) => snap.docs.map((d) => d.data()));
            return ok(panels);
        }
        catch (error) {
            return err(firebaseErr(error instanceof Error
                ? error.message
                : "Error al leer paneles por id", undefined, error instanceof Error ? error.stack : undefined));
        }
    }
    async findByRef(ref) {
        const docSnap = await getDoc(ref.withConverter(panelConverter));
        if (docSnap.exists())
            return ok(docSnap.data());
        return err(firebaseErr("Panel no encontrado"));
    }
    async findDocRef(id) {
        try {
            return ok(doc(this.firestore, this.getCollectionPath(), id));
        }
        catch {
            return err(firebaseErr("No se pudo generar la referencia del documento"));
        }
    }
    async findBySharedId(sharedId) {
        const q = query(collectionGroup(this.firestore, "panels").withConverter(panelConverter), where("sharedWith", "==", sharedId.id));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty)
            return ok(undefined);
        return ok(querySnapshot.docs[0].data());
    }
    async findArchived(parentId) {
        const q = query(this.collectionRef(), where("isArchived", "==", true), where("parentId", "==", parentId));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty)
            return ok(undefined);
        return ok(querySnapshot.docs.map((d) => d.data()));
    }
    // ─── Mutaciones — sin getDoc extra post-escritura ─────────────────────────
    async create(data, parentId) {
        const { accountType, id: ownerId } = this.getUser();
        const now = Timestamp.now();
        const panelData = {
            ...data,
            parentId: parentId ?? null,
            createdAt: data.createdAt ?? now,
            updatedAt: data.updatedAt ?? now,
        };
        const docRef = await addDoc(this.collectionRef(), panelData);
        // Construimos el panel localmente para evitar el getDoc extra.
        return ok({ ...panelData, id: docRef.id, ownerId, ownerAccountType: accountType });
    }
    async addSubPanel(parentRef, _childRef) {
        try {
            await updateDoc(parentRef, { updatedAt: Timestamp.now() });
            return ok(undefined);
        }
        catch {
            return err(firebaseErr("Error al actualizar el panel padre"));
        }
    }
    async archive(id) {
        try {
            const docRef = this.docRef(id);
            const docSnap = await getDoc(docRef);
            if (!docSnap.exists()) {
                return err(firebaseErr(`Panel con id "${id}" no encontrado`));
            }
            const currentPanel = docSnap.data();
            const updatedPanel = {
                ...currentPanel,
                isArchived: true,
                updatedAt: Timestamp.now(),
            };
            await updateDoc(docRef, { isArchived: true, updatedAt: updatedPanel.updatedAt });
            return ok(updatedPanel);
        }
        catch (error) {
            return err(firebaseErr(error instanceof Error ? error.message : "Error al archivar el panel", undefined, error instanceof Error ? error.stack : undefined));
        }
    }
    async unarchive(id) {
        try {
            const docRef = this.docRef(id);
            const docSnap = await getDoc(docRef);
            if (!docSnap.exists()) {
                return err(firebaseErr(`Panel con id "${id}" no encontrado`));
            }
            const currentPanel = docSnap.data();
            const updatedPanel = {
                ...currentPanel,
                isArchived: false,
                updatedAt: Timestamp.now(),
            };
            await updateDoc(docRef, {
                isArchived: deleteField(),
                updatedAt: updatedPanel.updatedAt,
            });
            return ok(updatedPanel);
        }
        catch (error) {
            return err(firebaseErr(error instanceof Error ? error.message : "Error al desarchivar el panel", undefined, error instanceof Error ? error.stack : undefined));
        }
    }
    async update(id, data) {
        const { accountType, id: ownerId } = this.getUser();
        const now = Timestamp.now();
        const updateData = withoutId({ ...data, updatedAt: now });
        await updateDoc(this.docRef(id), updateData);
        // Sin getDoc extra: reconstruimos localmente con lo que acabamos de escribir.
        return ok({ id, ownerId, ownerAccountType: accountType, ...updateData });
    }
    async delete(id) {
        await deleteDoc(this.docRef(id));
        return ok(undefined);
    }
    /**
     * BFS contra Firestore (no contra la caché local) para encontrar TODOS los
     * descendientes de `rootId`, a cualquier profundidad. Ir directo a la
     * fuente acá es intencional: la caché puede no tener cargada una rama
     * entera del árbol que igual hay que borrar.
     */
    async collectDescendantIds(rootId) {
        const descendantIds = [];
        const queue = [rootId];
        while (queue.length > 0) {
            const currentId = queue.shift();
            const parentRef = doc(this.firestore, this.getCollectionPath(), currentId);
            const childrenQuery = query(this.collectionRef(), where("parentId", "==", parentRef));
            const snap = await getDocs(childrenQuery);
            for (const childDoc of snap.docs) {
                descendantIds.push(childDoc.id);
                queue.push(childDoc.id);
            }
        }
        return descendantIds;
    }
    async deleteCascade(id) {
        const FIRESTORE_BATCH_LIMIT = 500;
        try {
            const descendantIds = await this.collectDescendantIds(id);
            const deletedIds = [id, ...descendantIds];
            // Firestore permite un máximo de 500 operaciones por batch — si el
            // subárbol es más grande, lo segmentamos en varios batches. Cada
            // batch sigue siendo atómico en sí mismo; entre batches no hay
            // rollback cruzado, que es la mejor garantía disponible arriba del
            // límite duro de la API.
            for (let i = 0; i < deletedIds.length; i += FIRESTORE_BATCH_LIMIT) {
                const chunk = deletedIds.slice(i, i + FIRESTORE_BATCH_LIMIT);
                const batch = writeBatch(this.firestore);
                for (const panelId of chunk) {
                    batch.delete(doc(this.firestore, this.getCollectionPath(), panelId));
                }
                await batch.commit();
            }
            return ok({ deletedIds });
        }
        catch (error) {
            return err(firebaseErr(error instanceof Error
                ? error.message
                : "Error al eliminar el panel y sus descendientes", undefined, error instanceof Error ? error.stack : undefined));
        }
    }
    async deleteArchived(ref) {
        try {
            const q = query(collection(this.firestore, ref.path), where(documentId(), "==", ref.id));
            const snapshot = await getDocs(q);
            const panels = [];
            const batch = writeBatch(this.firestore);
            snapshot.docs.forEach((docSnap) => {
                const panel = docSnap.data();
                panels.push(panel);
                batch.delete(docSnap.ref);
            });
            await batch.commit();
            return ok(panels);
        }
        catch (error) {
            return err(firebaseErr(error instanceof Error
                ? error.message
                : "Error al eliminar el panel archivado", undefined, error instanceof Error ? error.stack : undefined));
        }
    }
}
