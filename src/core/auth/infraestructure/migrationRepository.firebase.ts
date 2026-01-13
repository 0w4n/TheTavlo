import {
  collection,
  doc,
  getDocs,
  writeBatch,
  query,
  Firestore,
} from "firebase/firestore";
import type { MigrationRepository } from "../app/migrationRepository.interface";
import type { MigrationDecision, MigrationResult } from "../domain/migration.entity";

export class FirebaseMigrationRepository implements MigrationRepository {
  constructor(private firestore: Firestore) {}

  async checkExistingData(userId: string): Promise<boolean> {
    const collections = ["tasks", "events", "exams", "boards"];

    for (const collectionName of collections) {
      const q = query(
        collection(this.firestore, `users/${userId}/${collectionName}`)
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        return true; // Tiene datos existentes
      }
    }

    return false;
  }

  async migrateData(decision: MigrationDecision): Promise<MigrationResult> {
    try {
      switch (decision.strategy) {
        case "move":
          await this.moveGuestToUser(
            decision.sourceGuestId,
            decision.targetUserId
          );
          break;

        case "merge":
          await this.mergeGuestIntoUser(
            decision.sourceGuestId,
            decision.targetUserId
          );
          break;

        case "keep-separate":
          // No hacer nada, los datos del guest se quedan huérfanos
          // o podrías eliminarlos después
          await this.deleteGuestData(decision.sourceGuestId);
          break;
      }

      // Contar items migrados
      const itemsMigrated = await this.countMigratedItems(
        decision.sourceGuestId
      );

      return {
        success: true,
        newUserId: decision.targetUserId,
        itemsMigrated,
      };
    } catch (error: any) {
      return {
        success: false,
        newUserId: decision.targetUserId,
        itemsMigrated: 0,
        error: error.message,
      };
    }
  }

  async moveGuestToUser(guestId: string, userId: string): Promise<void> {
    const collections = ["tasks", "events", "exams", "boards"];
    const batch = writeBatch(this.firestore);

    for (const collectionName of collections) {
      const guestCollectionRef = collection(
        this.firestore,
        `guests/${guestId}/${collectionName}`
      );
      const guestSnapshot = await getDocs(guestCollectionRef);

      guestSnapshot.docs.forEach((docSnap) => {
        const data = docSnap.data();

        // Crear en la colección del usuario
        const userDocRef = doc(
          this.firestore,
          `users/${userId}/${collectionName}`,
          docSnap.id
        );
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

  async mergeGuestIntoUser(guestId: string, userId: string): Promise<void> {
    const collections = ["tasks", "events", "exams", "boards"];
    const batch = writeBatch(this.firestore);

    for (const collectionName of collections) {
      const guestCollectionRef = collection(
        this.firestore,
        `guests/${guestId}/${collectionName}`
      );
      const guestSnapshot = await getDocs(guestCollectionRef);

      guestSnapshot.docs.forEach((docSnap) => {
        const data = docSnap.data();

        // Crear NUEVO documento en la colección del usuario (sin pisar los existentes)
        const userDocRef = doc(
          collection(this.firestore, `users/${userId}/${collectionName}`)
        );
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

  async deleteGuestData(guestId: string): Promise<void> {
    const collections = ["tasks", "events", "exams", "boards"];
    const batch = writeBatch(this.firestore);

    for (const collectionName of collections) {
      const guestCollectionRef = collection(
        this.firestore,
        `guests/${guestId}/${collectionName}`
      );
      const guestSnapshot = await getDocs(guestCollectionRef);

      guestSnapshot.docs.forEach((docSnap) => {
        batch.delete(docSnap.ref);
      });
    }

    await batch.commit();
  }

  private async countMigratedItems(guestId: string): Promise<number> {
    const collections = ["tasks", "events", "exams", "boards"];
    let total = 0;

    for (const collectionName of collections) {
      const q = query(
        collection(this.firestore, `guests/${guestId}/${collectionName}`)
      );
      const snapshot = await getDocs(q);
      total += snapshot.size;
    }

    return total;
  }
}
