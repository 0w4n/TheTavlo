import type { InvitationService } from "#features/invitations/app/invitation.service";
import { type CreatedAnyInvitationDTO, type Invitation } from "#features/invitations/domain/invitation.entity";
import { type PropsWithChildren } from "react";
type InvitationContextValue = {
    invitation: Invitation | undefined;
    createInvitation: (data: Omit<CreatedAnyInvitationDTO, "createdAt" | "updatedAt" | "token" | "objRef">, parentRef: string) => Promise<void>;
    acceptInvitation: (id: string) => Promise<void>;
    rejectInvitation: (id: string) => Promise<void>;
    clearError: () => void;
};
export declare const InvitationContext: import("react").Context<InvitationContextValue | undefined>;
type InvitationProviderProps = PropsWithChildren<{
    invitationService: InvitationService;
}>;
export declare function InvitationProvider({ children, invitationService, }: InvitationProviderProps): import("react").JSX.Element;
export {};
