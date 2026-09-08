import { trpcMutation, trpcQuery } from "#core/appCore/infraestructure/api/trpcClient";
import type { MigrationRepository } from "../app/migrationRepository.interface";
import type { MigrationDecision, MigrationResult } from "../domain/migration.entity";

export class TrpcMigrationRepository implements MigrationRepository {
  async checkExistingData(userId: string): Promise<boolean> {
    return trpcQuery<boolean>("migration.checkExistingData", { userId });
  }

  async migrateData(decision: MigrationDecision): Promise<MigrationResult> {
    try {
      return await trpcMutation<MigrationResult>("migration.migrate", {
        sourceGuestId: decision.sourceGuestId,
        targetUserId: decision.targetUserId,
        strategy: decision.strategy,
      });
    } catch (error) {
      return {
        success: false,
        newUserId: decision.targetUserId,
        itemsMigrated: 0,
        error: error instanceof Error ? error.message : "Error al migrar los datos",
      };
    }
  }

  async moveGuestToUser(guestId: string, userId: string): Promise<void> {
    await this.migrateData({ strategy: "move", sourceGuestId: guestId, targetUserId: userId, hasExistingData: false });
  }

  async mergeGuestIntoUser(guestId: string, userId: string): Promise<void> {
    await this.migrateData({ strategy: "merge", sourceGuestId: guestId, targetUserId: userId, hasExistingData: true });
  }

  async deleteGuestData(guestId: string): Promise<void> {
    await this.migrateData({ strategy: "keep-separate", sourceGuestId: guestId, targetUserId: guestId, hasExistingData: false });
  }
}
