import type { AccountType } from "#core/auth/domain/user.entity";

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
