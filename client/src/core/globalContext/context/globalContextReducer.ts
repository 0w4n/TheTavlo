import type { AccountType } from "#core/auth/domain/user.entity";
import type { GlobalContextProps } from "./globalContex.type";

export type GlobalContextState =
  | {
      status: "loading";
      panel?: GlobalContextProps["panel"];
    }
  | {
      status: "ready";
      state: GlobalContextProps;
    };

export type GlobalContextAction =
  | { type: "SET_USER"; payload: { userId: string; accountType: AccountType } }
  | {
      type: "SET_PANEL";
      payload: {
        panelId: string;
        ownerId?: string;
        ownerAccountType?: AccountType;
      };
    };

export const initialGlobalContext: GlobalContextState = {
  status: "loading",
};

export function globalContextReducer(
  state: GlobalContextState,
  action: GlobalContextAction,
): GlobalContextState {
  switch (action.type) {
    case "SET_USER":
      return {
        status: "ready",
        state: {
          user: {
            userId: action.payload.userId,
            accountType: action.payload.accountType,
          },
          panel: state.status === "loading" && state.panel
            ? state.panel
            : {
                panelId: "",
                ownerId: undefined,
                ownerAccountType: undefined,
              },
        },
      };

    case "SET_PANEL":
      if (state.status !== "ready") {
        return {
          status: "loading",
          panel: action.payload,
        };
      }

      return {
        status: "ready",
        state: {
          ...state.state,
          panel: {
            panelId: action.payload.panelId,
            ownerId: action.payload.ownerId,
            ownerAccountType: action.payload.ownerAccountType,
          },
        },
      };

    default:
      return state;
  }
}
