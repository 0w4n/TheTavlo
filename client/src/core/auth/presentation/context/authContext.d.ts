import type AuthService from "../../app/auth.service";
import type { MigrationStrategy } from "../../domain/migration.entity";
import { type PropsWithChildren } from "react";
import { type AuthState } from "./authReducer";
type AuthContextValue = {
    state: AuthState;
    signInAsGuest: () => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    upgradeToGoogle: () => Promise<void>;
    completeMigration: (strategy: MigrationStrategy) => Promise<void>;
    signOut: () => Promise<void>;
    clearError: () => void;
};
export declare const AuthContext: import("react").Context<AuthContextValue | undefined>;
export declare function AuthProvider({ children, authService, }: PropsWithChildren<{
    authService: AuthService;
}>): import("react").JSX.Element;
export {};
