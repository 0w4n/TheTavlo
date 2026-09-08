import type { AccountType } from "#core/auth/domain/user.entity";
import { createContext } from "react";
import type { GlobalContextState } from "./globalContextReducer";

export const GlobalContext = createContext<GlobalContextValue | undefined>(
  undefined,
);

export type GlobalContextValue = {
  state: GlobalContextState;
};

export interface GlobalContextProps {
  user: {
    userId: string;
    accountType: AccountType;
  };
  panel: {
    ownerId?: string;
    ownerAccountType?: AccountType;
    panelId: string;
  };
  // theme: {
  //   mode: "light" | "dark" | "system";
  //   preset: string;
  //   fontSize: "small" | "medium" | "large";
  //   borderRadius: "square" | "rounded" | "pill";
  //   animations: boolean;
  // };
}
