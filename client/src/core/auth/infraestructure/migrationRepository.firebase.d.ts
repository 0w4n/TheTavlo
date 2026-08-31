import { Firestore } from "firebase/firestore";
import type { MigrationRepository } from "../app/migrationRepository.interface";
import type { MigrationDecision, MigrationResult } from "../domain/migration.entity";
export declare class FirebaseMigrationRepository implements MigrationRepository {
    private firestore;
    constructor(firestore: Firestore);
    checkExistingData(userId: string): Promise<boolean>;
    migrateData(decision: MigrationDecision): Promise<MigrationResult>;
    moveGuestToUser(guestId: string, userId: string): Promise<void>;
    mergeGuestIntoUser(guestId: string, userId: string): Promise<void>;
    deleteGuestData(guestId: string): Promise<void>;
    private countMigratedItems;
}
