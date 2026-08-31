import type { AccountType } from "#core/auth/domain/user.entity";
import { UserRole } from "../domain/invitation.entity";
export interface InviteByEmailInput {
    panelId: string;
    panelName: string;
    ownerId: string;
    ownerAccountType: AccountType;
    email: string;
    role: UserRole;
}
export interface PublicLinkInput {
    panelId: string;
    ownerId: string;
    ownerAccountType: AccountType;
}
/**
 * Formas "sobre HTTP" — a propósito NO son los tipos de dominio
 * (`Invitation`/`SharedUser` en invitation.entity.ts), porque el backend
 * serializa `DocumentReference`/`Timestamp` (no son JSON-safe tal cual;
 * ver `serializeInvitation`/`serializeSharedUser` en
 * `invitations.router.ts`) a `{ path }` y epoch-millis respectivamente.
 * Espejo manual mientras no haya un monorepo (auditoría, sección C).
 */
export interface SerializedInvitation {
    id: string;
    type: string;
    objType: string;
    mode: "link" | "users";
    role: UserRole;
    targetRef: {
        path: string;
    } | null;
    token: string;
    createdBy: string;
    createdAt: number | null;
    updatedAt: number | null;
    expiresAt: number | null;
}
export interface SerializedSharedUser {
    userId: string | null;
    email: string | null;
    status: "pending" | "accepted" | "rejected";
    role: UserRole;
    createdAt: number | null;
    updatedAt: number | null;
    statusUpdatedAt: number | null;
}
export type InvitationAccessResponse = {
    kind: "public";
    invitation: SerializedInvitation;
} | {
    kind: "private-pending";
    invitation: SerializedInvitation;
    sharedUser: SerializedSharedUser;
} | {
    kind: "private-accepted";
    invitation: SerializedInvitation;
    sharedUser: SerializedSharedUser;
} | {
    kind: "private-rejected";
    invitation: SerializedInvitation;
    sharedUser: SerializedSharedUser;
} | {
    kind: "not-invited";
    invitation: SerializedInvitation;
    requiresLogin?: boolean;
} | {
    kind: "expired" | "revoked" | "not-found";
};
/** Parsea "{accountType}/{ownerId}/panels/{panelId}" -> partes, o null si no calza. */
export declare function parsePanelDocPath(path: string | undefined | null): {
    ownerAccountType: string;
    ownerId: string;
    panelId: string;
} | null;
export declare const InvitationApiClient: {
    inviteByEmail(input: InviteByEmailInput): Promise<{
        invitationId: string;
        hasAccount: boolean;
    }>;
    createPublicLink(input: PublicLinkInput): Promise<{
        invitationId: string;
        url: string;
    }>;
    resolveAccess(input: {
        invitationId: string;
        token: string;
    }): Promise<InvitationAccessResponse>;
    respond(input: {
        invitationId: string;
        token: string;
        response: "accept" | "reject";
    }): Promise<{
        status: "accepted" | "rejected";
    }>;
};
export { UserRole };
