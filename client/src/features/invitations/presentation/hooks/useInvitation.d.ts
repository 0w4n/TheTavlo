export default function useInvitation(): {
    invitation: import("../../domain/invitation.entity").Invitation | undefined;
    createInvitation: (data: Omit<import("../../domain/invitation.entity").CreatedAnyInvitationDTO, "createdAt" | "updatedAt" | "token" | "objRef">, parentRef: string) => Promise<void>;
    acceptInvitation: (id: string) => Promise<void>;
    rejectInvitation: (id: string) => Promise<void>;
    clearError: () => void;
};
