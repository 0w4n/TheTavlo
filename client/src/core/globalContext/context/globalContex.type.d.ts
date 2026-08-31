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
}
