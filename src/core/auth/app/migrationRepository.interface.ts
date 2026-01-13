import type { MigrationDecision, MigrationResult } from "../domain/migration.entity";

export interface MigrationRepository {
  checkExistingData(userId: string): Promise<boolean>;
  migrateData(decision: MigrationDecision): Promise<MigrationResult>;
  moveGuestToUser(guestId: string, userId: string): Promise<void>;
  mergeGuestIntoUser(guestId: string, userId: string): Promise<void>;
  deleteGuestData(guestId: string): Promise<void>;
}
