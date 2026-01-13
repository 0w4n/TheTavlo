import type AuthService from "../../app/auth.service";
import type {
  MigrationStrategy,
  MigrationDecision,
} from "../../domain/migration.entity";
import type { GoogleUser, GuestUser, User } from "../../domain/user.entity";
import {
  createContext,
  type PropsWithChildren,
  useReducer,
  useEffect,
  useCallback,
} from "react";

type AuthState = {
  user: User | undefined;
  loading: boolean;
  error: string | null;
  initialized: boolean;
  migrationPending: boolean;
  migrationData: {
    hasExistingData: boolean;
    googleUser: GoogleUser | undefined;
    guestId: string | null;
  } | null;
};

type AuthAction =
  | { type: "AUTH_STATE_CHANGED"; payload: User | undefined }
  | { type: "AUTH_LOADING"; payload: boolean }
  | { type: "AUTH_ERROR"; payload: string }
  | {
      type: "MIGRATION_PENDING";
      payload: {
        hasExistingData: boolean;
        googleUser: GoogleUser;
        guestId: string;
      };
    }
  | { type: "MIGRATION_COMPLETED" }
  | { type: "CLEAR_ERROR" };

const initialAuthState: AuthState = {
  user: undefined,
  loading: true,
  error: null,
  initialized: false,
  migrationPending: false,
  migrationData: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "AUTH_STATE_CHANGED":
      return {
        ...state,
        user: action.payload,
        loading: false,
        initialized: true,
      };
    case "AUTH_LOADING":
      return { ...state, loading: action.payload };
    case "AUTH_ERROR":
      return { ...state, error: action.payload, loading: false };
    case "MIGRATION_PENDING":
      return {
        ...state,
        migrationPending: true,
        migrationData: {
          hasExistingData: action.payload.hasExistingData,
          googleUser: action.payload.googleUser,
          guestId: action.payload.guestId,
        },
        loading: false,
      };
    case "MIGRATION_COMPLETED":
      return {
        ...state,
        migrationPending: false,
        migrationData: null,
      };
    case "CLEAR_ERROR":
      return { ...state, error: null };
    default:
      return state;
  }
}

type AuthContextValue = {
  state: AuthState;
  signInAsGuest: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  upgradeToGoogle: () => Promise<void>;
  completeMigration: (strategy: MigrationStrategy) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  children,
  authService,
}: PropsWithChildren<{ authService: AuthService }>) {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((user) => {
      dispatch({ type: "AUTH_STATE_CHANGED", payload: user });
    });
    return unsubscribe;
  }, [authService]);

  const signInAsGuest = useCallback(async () => {
    dispatch({ type: "AUTH_LOADING", payload: true });
    const result = await authService.signInAsGuest();

    if (result.error) {
      dispatch({ type: "AUTH_ERROR", payload: result.error });
      throw new Error(result.error);
    }

    dispatch({ type: "AUTH_LOADING", payload: false });
  }, [authService]);

  const signInWithGoogle = useCallback(async () => {
    dispatch({ type: "AUTH_LOADING", payload: true });
    const result = await authService.signInWithGoogle();

    if (result.error) {
      dispatch({ type: "AUTH_ERROR", payload: result.error });
      throw new Error(result.error);
    }

    dispatch({ type: "AUTH_LOADING", payload: false });
  }, [authService]);

  const upgradeToGoogle = useCallback(async () => {
    if (!state.user || state.user.accountType !== "guests") {
      throw new Error("Solo se puede actualizar desde una cuenta de invitado");
    }

    dispatch({ type: "AUTH_LOADING", payload: true });
    const result = await authService.upgradeToGoogle(
      state.user as unknown as GuestUser
    );

    if (result.error) {
      dispatch({ type: "AUTH_ERROR", payload: result.error });
      throw new Error(result.error);
    }

    if (result.needsMigrationDecision && result.user) {
      // Requiere decisión del usuario
      dispatch({
        type: "MIGRATION_PENDING",
        payload: {
          hasExistingData: result.hasExistingData!,
          googleUser: result.user,
          guestId: (state.user as unknown as GuestUser).guestId,
        },
      });
    } else {
      // Migración automática completada
      dispatch({ type: "AUTH_LOADING", payload: false });
    }
  }, [authService, state.user]);

  const completeMigration = useCallback(
    async (strategy: MigrationStrategy) => {
      if (!state.migrationData) {
        throw new Error("No hay migración pendiente");
      }

      dispatch({ type: "AUTH_LOADING", payload: true });

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

      dispatch({ type: "MIGRATION_COMPLETED" });
      dispatch({ type: "AUTH_LOADING", payload: false });
    },
    [authService, state.migrationData]
  );

  const signOut = useCallback(async () => {
    const result = await authService.signOut();
    if (result.error) {
      dispatch({ type: "AUTH_ERROR", payload: result.error });
      throw new Error(result.error);
    }
  }, [authService]);

  const clearError = useCallback(() => {
    dispatch({ type: "CLEAR_ERROR" });
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
