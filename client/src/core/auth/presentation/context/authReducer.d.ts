import type { GoogleUser, User } from "#core/auth/domain/user.entity";
export type MigrationData = {
    hasExistingData: boolean;
    googleUser?: GoogleUser;
    guestId?: string;
};
export type AuthState = {
    status: "initializing";
} | {
    status: "unauthenticated";
} | {
    status: "authenticated";
    user: User;
    migrationPending: false;
    migrationData: null;
} | {
    status: "migration-pending";
    user: User;
    migrationPending: true;
    migrationData: MigrationData;
} | {
    status: "error";
    error: string;
};
type AuthAction = {
    type: "AUTH_STATE_CHANGED";
    payload: User | null;
} | {
    type: "AUTH_ERROR";
    payload: string;
} | {
    type: "MIGRATION_PENDING";
    payload: MigrationData;
} | {
    type: "MIGRATION_COMPLETED";
} | {
    type: "CLEAR_ERROR";
};
export declare function authReducer(state: AuthState, action: AuthAction): AuthState;
export {};
