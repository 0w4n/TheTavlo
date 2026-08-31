import type { User } from "../../auth/domain/user.entity";
import type { MigrationDecision, MigrationResult } from "../domain/migration.entity";
import type { GuestUser, GoogleUser } from "../domain/user.entity";
import type { AuthRepository } from "./authRepository.interface";
import type { MigrationRepository } from "./migrationRepository.interface";
export default class AuthService {
    private authRepository;
    private migrationRepository;
    constructor(authRepository: AuthRepository, migrationRepository: MigrationRepository);
    signInAsGuest(): Promise<{
        user?: GuestUser;
        error?: string;
    }>;
    signInWithGoogle(): Promise<{
        user?: GoogleUser;
        error?: string;
    }>;
    upgradeToGoogle(currentGuest: GuestUser): Promise<{
        user?: GoogleUser;
        needsMigrationDecision?: boolean;
        hasExistingData?: boolean;
        error?: string;
    }>;
    executeMigration(decision: MigrationDecision): Promise<MigrationResult>;
    getCurrentUser(): User | null;
    onAuthStateChanged(callback: (user: User | null) => void): () => void;
    signOut(): Promise<{
        success: boolean;
        error?: string;
    }>;
    private handleAuthError;
}
