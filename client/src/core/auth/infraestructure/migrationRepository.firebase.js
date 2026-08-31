import { collection, doc, getDocs, writeBatch, query, Firestore, } from "firebase/firestore";
export class FirebaseMigrationRepository {
    constructor(firestore) {
        Object.defineProperty(this, "firestore", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: firestore
        });
    }
    async checkExistingData(userId) {
        const collections = ["tasks", "events", "exams", "boards"];
        for (const collectionName of collections) {
            const q = query(collection(this.firestore, `users/${userId}/${collectionName}`));
            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
                return true; // Tiene datos existentes
            }
        }
        return false;
    }
    async migrateData(decision) {
        try {
            switch (decision.strategy) {
                case "move":
                    await this.moveGuestToUser(decision.sourceGuestId, decision.targetUserId);
                    break;
                case "merge":
                    await this.mergeGuestIntoUser(decision.sourceGuestId, decision.targetUserId);
                    break;
                case "keep-separate":
                    // No hacer nada, los datos del guest se quedan huérfanos
                    // o podrías eliminarlos después
                    await this.deleteGuestData(decision.sourceGuestId);
                    break;
            }
            // Contar items migrados
            const itemsMigrated = await this.countMigratedItems(decision.sourceGuestId);
            return {
                success: true,
                newUserId: decision.targetUserId,
                itemsMigrated,
            };
        }
        catch (error) {
            return {
                success: false,
                newUserId: decision.targetUserId,
                itemsMigrated: 0,
                error: error.message,
            };
        }
    }
    async moveGuestToUser(guestId, userId) {
        const collections = ["tasks", "events", "exams", "boards"];
        const batch = writeBatch(this.firestore);
        for (const collectionName of collections) {
            const guestCollectionRef = collection(this.firestore, `guests/${guestId}/${collectionName}`);
            const guestSnapshot = await getDocs(guestCollectionRef);
            guestSnapshot.docs.forEach((docSnap) => {
                const data = docSnap.data();
                // Crear en la colección del usuario
                const userDocRef = doc(this.firestore, `users/${userId}/${collectionName}`, docSnap.id);
                batch.set(userDocRef, {
                    ...data,
                    userId, // Actualizar el userId
                    migratedFrom: guestId,
                    migratedAt: new Date(),
                });
                // Eliminar de guests
                batch.delete(docSnap.ref);
            });
        }
        await batch.commit();
    }
    async mergeGuestIntoUser(guestId, userId) {
        const collections = ["tasks", "events", "exams", "boards"];
        const batch = writeBatch(this.firestore);
        for (const collectionName of collections) {
            const guestCollectionRef = collection(this.firestore, `guests/${guestId}/${collectionName}`);
            const guestSnapshot = await getDocs(guestCollectionRef);
            guestSnapshot.docs.forEach((docSnap) => {
                const data = docSnap.data();
                // Crear NUEVO documento en la colección del usuario (sin pisar los existentes)
                const userDocRef = doc(collection(this.firestore, `users/${userId}/${collectionName}`));
                batch.set(userDocRef, {
                    ...data,
                    userId,
                    migratedFrom: guestId,
                    migratedAt: new Date(),
                });
                // Eliminar de guests
                batch.delete(docSnap.ref);
            });
        }
        await batch.commit();
    }
    async deleteGuestData(guestId) {
        const collections = ["tasks", "events", "exams", "boards"];
        const batch = writeBatch(this.firestore);
        for (const collectionName of collections) {
            const guestCollectionRef = collection(this.firestore, `guests/${guestId}/${collectionName}`);
            const guestSnapshot = await getDocs(guestCollectionRef);
            guestSnapshot.docs.forEach((docSnap) => {
                batch.delete(docSnap.ref);
            });
        }
        await batch.commit();
    }
    async countMigratedItems(guestId) {
        const collections = ["tasks", "events", "exams", "boards"];
        let total = 0;
        for (const collectionName of collections) {
            const q = query(collection(this.firestore, `guests/${guestId}/${collectionName}`));
            const snapshot = await getDocs(q);
            total += snapshot.size;
        }
        return total;
    }
}
