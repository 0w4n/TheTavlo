export default function useAuth(): {
    state: import("../context/authReducer").AuthState;
    signInAsGuest: () => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    upgradeToGoogle: () => Promise<void>;
    completeMigration: (strategy: import("../../domain/migration.entity").MigrationStrategy) => Promise<void>;
    signOut: () => Promise<void>;
    clearError: () => void;
};
