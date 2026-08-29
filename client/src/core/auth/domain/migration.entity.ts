export type MigrationStrategy = "move" | "merge" | "keep-separate";

export interface MigrationDecision {
  strategy: MigrationStrategy;
  targetUserId: string; // A dónde van los datos
  sourceGuestId: string; // De dónde vienen
  hasExistingData: boolean; // Si el usuario de Google ya tenía datos
}

export interface MigrationResult {
  success: boolean;
  newUserId: string;
  itemsMigrated: number;
  error?: string;
}
