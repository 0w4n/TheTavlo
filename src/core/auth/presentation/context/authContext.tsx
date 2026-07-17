import type AuthService from "../../app/auth.service";
import type {
  MigrationStrategy,
  MigrationDecision,
} from "../../domain/migration.entity";
import type { GuestUser } from "../../domain/user.entity";
import {
  createContext,
  type PropsWithChildren,
  useReducer,
  useEffect,
  useCallback,
} from "react";
import { authReducer, type AuthState } from "./authReducer";

const initialAuthState: AuthState = {
  status: "initializing",
};

type AuthContextValue = {
  state: AuthState;
  signInAsGuest: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  upgradeToGoogle: () => Promise<void>;
  completeMigration: (strategy: MigrationStrategy) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
};

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);

export function AuthProvider({
  children,
  authService,
}: PropsWithChildren<{ authService: AuthService }>) {
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
    if (
      state.status !== "authenticated" ||
      state.user.accountType !== "guests"
    ) {
      throw new Error("Solo se puede actualizar desde una cuenta de invitado");
    }

    const guestUser = state.user as unknown as GuestUser;

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

  const completeMigration = useCallback(
    async (strategy: MigrationStrategy) => {
      if (state.status !== "migration-pending") {
        throw new Error("No hay migración pendiente");
      }

      const decision: MigrationDecision = {
        strategy,
        targetUserId: state.migrationData.googleUser!.id,
        sourceGuestId: state.migrationData.guestId!,
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
    },
    [authService, state],
  );

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

  return (
    <AuthContext.Provider
      value={{
        state,
        signInAsGuest,
        signInWithGoogle,
        upgradeToGoogle,
        completeMigration,
        signOut,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
