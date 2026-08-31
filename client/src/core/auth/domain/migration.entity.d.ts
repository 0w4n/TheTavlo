export type MigrationStrategy = "move" | "merge" | "keep-separate";
export interface MigrationDecision {
    strategy: MigrationStrategy;
    targetUserId: string;
    sourceGuestId: string;
    hasExistingData: boolean;
}
export interface MigrationResult {
    success: boolean;
    newUserId: string;
    itemsMigrated: number;
    error?: string;
}
