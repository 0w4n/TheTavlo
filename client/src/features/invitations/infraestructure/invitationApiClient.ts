import { trpcMutation, trpcQuery } from "#shared/infraestructure/api/trpcClient";
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
  targetRef: { path: string } | null;
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

export type InvitationAccessResponse =
  | { kind: "public"; invitation: SerializedInvitation }
  | { kind: "private-pending"; invitation: SerializedInvitation; sharedUser: SerializedSharedUser }
  | { kind: "private-accepted"; invitation: SerializedInvitation; sharedUser: SerializedSharedUser }
  | { kind: "private-rejected"; invitation: SerializedInvitation; sharedUser: SerializedSharedUser }
  | { kind: "not-invited"; invitation: SerializedInvitation; requiresLogin?: boolean }
  | { kind: "expired" | "revoked" | "not-found" };

/** Parsea "{accountType}/{ownerId}/panels/{panelId}" -> partes, o null si no calza. */
export function parsePanelDocPath(
  path: string | undefined | null,
): { ownerAccountType: string; ownerId: string; panelId: string } | null {
  if (!path) return null;
  const [ownerAccountType, ownerId, collection, panelId] = path.split("/");
  if (!ownerAccountType || !ownerId || collection !== "panels" || !panelId) return null;
  return { ownerAccountType, ownerId, panelId };
}

export const InvitationApiClient = {
  inviteByEmail(input: InviteByEmailInput) {
    return trpcMutation<{ invitationId: string; hasAccount: boolean }>(
      "invitations.inviteByEmail",
      input,
    );
  },

  createPublicLink(input: PublicLinkInput) {
    return trpcMutation<{ invitationId: string; url: string }>(
      "invitations.createPublicLink",
      input,
    );
  },

  resolveAccess(input: { invitationId: string; token: string }) {
    return trpcQuery<InvitationAccessResponse>("invitations.resolveAccess", input);
  },

  respond(input: { invitationId: string; token: string; response: "accept" | "reject" }) {
    return trpcMutation<{ status: "accepted" | "rejected" }>("invitations.respond", input);
  },
};

export { UserRole };
