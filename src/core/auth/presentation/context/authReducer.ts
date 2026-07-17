import type { GoogleUser, User } from "#core/auth/domain/user.entity";

export type MigrationData = {
  hasExistingData: boolean;
  googleUser?: GoogleUser;
  guestId?: string;
};

export type AuthState =
  | {
      status: "initializing";
    }
  | {
      status: "unauthenticated";
    }
  | {
      status: "authenticated";
      user: User;
      migrationPending: false;
      migrationData: null;
    }
  | {
      status: "migration-pending";
      user: User;
      migrationPending: true;
      migrationData: MigrationData;
    }
  | {
      status: "error";
      error: string;
    };

type AuthAction =
  | {
      type: "AUTH_STATE_CHANGED";
      payload: User | null;
    }
  | {
      type: "AUTH_ERROR";
      payload: string;
    }
  | {
      type: "MIGRATION_PENDING";
      payload: MigrationData;
    }
  | {
      type: "MIGRATION_COMPLETED";
    }
  | {
      type: "CLEAR_ERROR";
    };

export function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "AUTH_STATE_CHANGED":
      if (!action.payload) {
        return {
          status: "unauthenticated",
        };
      }

      return {
        status: "authenticated",
        user: action.payload,
        migrationPending: false,
        migrationData: null,
      };

    case "AUTH_ERROR":
      return {
        status: "error",
        error: action.payload,
      };

    case "MIGRATION_PENDING":
      if (state.status !== "authenticated") {
        return state;
      }

      return {
        status: "migration-pending",
        user: state.user,
        migrationPending: true,
        migrationData: action.payload,
      };

    case "MIGRATION_COMPLETED":
      if (state.status !== "migration-pending") {
        return state;
      }

      return {
        status: "authenticated",
        user: state.user,
        migrationPending: false,
        migrationData: null,
      };

    case "CLEAR_ERROR":
      return {
        status: "unauthenticated",
      };

    default:
      return state;
  }
}
