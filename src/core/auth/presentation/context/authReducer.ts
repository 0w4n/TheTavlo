import type { GoogleUser, User } from "#core/auth/domain/user.entity";

export type AuthState = {
  user: User | null;
  isLoading: boolean;
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
  | { type: "AUTH_STATE_CHANGED"; payload: User | null }
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

export function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "AUTH_STATE_CHANGED":
      return {
        ...state,
        user: action.payload,
        isLoading: false,
        initialized: true,
      };
    case "AUTH_LOADING":
      return { ...state, isLoading: action.payload };
    case "AUTH_ERROR":
      return { ...state, error: action.payload, isLoading: false };
    case "MIGRATION_PENDING":
      return {
        ...state,
        migrationPending: true,
        migrationData: {
          hasExistingData: action.payload.hasExistingData,
          googleUser: action.payload.googleUser,
          guestId: action.payload.guestId,
        },
        isLoading: false,
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