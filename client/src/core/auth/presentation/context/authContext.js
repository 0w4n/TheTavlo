import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useReducer, useEffect, useCallback, } from "react";
import { authReducer } from "./authReducer";
const initialAuthState = {
    status: "initializing",
};
export const AuthContext = createContext(undefined);
export function AuthProvider({ children, authService, }) {
    const [state, dispatch] = useReducer(authReducer, initialAuthState);
    useEffect(() => {
        const unsubscribe = authService.onAuthStateChanged((user) => {
            dispatch({
                type: "AUTH_STATE_CHANGED",
                payload: user,
            });
        });
        return unsubscribe;
    }, [authService]);
    const signInAsGuest = useCallback(async () => {
        const result = await authService.signInAsGuest();
        if (result.error) {
            dispatch({
                type: "AUTH_ERROR",
                payload: result.error,
            });
            throw new Error(result.error);
        }
    }, [authService]);
    const signInWithGoogle = useCallback(async () => {
        const result = await authService.signInWithGoogle();
        if (result.error) {
            dispatch({
                type: "AUTH_ERROR",
                payload: result.error,
            });
            throw new Error(result.error);
        }
    }, [authService]);
    const upgradeToGoogle = useCallback(async () => {
        if (state.status !== "authenticated" ||
            state.user.accountType !== "guests") {
            throw new Error("Solo se puede actualizar desde una cuenta de invitado");
        }
        const guestUser = state.user;
        const result = await authService.upgradeToGoogle(guestUser);
        if (result.error) {
            dispatch({
                type: "AUTH_ERROR",
                payload: result.error,
            });
            throw new Error(result.error);
        }
        if (result.needsMigrationDecision && result.user) {
            dispatch({
                type: "MIGRATION_PENDING",
                payload: {
                    hasExistingData: result.hasExistingData ?? false,
                    googleUser: result.user,
                    guestId: guestUser.guestId,
                },
            });
        }
    }, [authService, state]);
    const completeMigration = useCallback(async (strategy) => {
        if (state.status !== "migration-pending") {
            throw new Error("No hay migración pendiente");
        }
        const decision = {
            strategy,
            targetUserId: state.migrationData.googleUser.id,
            sourceGuestId: state.migrationData.guestId,
            hasExistingData: state.migrationData.hasExistingData,
        };
        const result = await authService.executeMigration(decision);
        if (!result.success) {
            dispatch({
                type: "AUTH_ERROR",
                payload: result.error || "Error en la migración",
            });
            throw new Error(result.error);
        }
        dispatch({
            type: "MIGRATION_COMPLETED",
        });
    }, [authService, state]);
    const signOut = useCallback(async () => {
        const result = await authService.signOut();
        if (result.error) {
            dispatch({
                type: "AUTH_ERROR",
                payload: result.error,
            });
            throw new Error(result.error);
        }
    }, [authService]);
    const clearError = useCallback(() => {
        dispatch({
            type: "CLEAR_ERROR",
        });
    }, []);
    return (_jsx(AuthContext.Provider, { value: {
            state,
            signInAsGuest,
            signInWithGoogle,
            upgradeToGoogle,
            completeMigration,
            signOut,
            clearError,
        }, children: children }));
}
