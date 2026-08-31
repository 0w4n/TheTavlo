import type { DocumentReference, Timestamp } from "firebase/firestore";
export declare enum InvitationStatus {
    PENDING = "pending",// def
    ACCEPTED = "accepted",
    REJECTED = "rejected",
    EXPIRED = "expired",
    REVOKED = "revoked"
}
export declare enum InvitationType {
    CHOWN = "chown",// Cambiar propietario
    CHMOD = "chmod",// Cambiar modo
    CHROL = "chrol",// Cambiar rol
    SHARE = "share"
}
export declare enum SharedObjType {
    PANEL = "panel",// def
    TASK = "task",
    NOTES = "notes",
    CALENDAR = "calendar",
    EVENT = "event"
}
export declare enum UserRole {
    EDITOR = "editor",
    VIEWER = "viewer"
}
export declare enum InvitationMode {
    LINK = "link",
    USERS = "users"
}
export interface Invitation {
    id: string;
    type: InvitationType;
    targetRef: DocumentReference;
    token: string;
    createdBy: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    expiresAt: Timestamp | null;
}
export interface ChownInvitation extends Invitation {
    type: InvitationType.CHOWN;
    newOwnerId: string;
}
export interface ChmodInvitation extends Invitation {
    type: InvitationType.CHMOD;
    targetUserId: string;
    newRole: UserRole;
}
export interface ShareInvitation extends Invitation {
    type: InvitationType.SHARE;
    objType: SharedObjType;
    mode: InvitationMode;
    role: UserRole;
    lastUpdatedBy: string;
}
export interface PublicInvitation extends ShareInvitation {
    mode: InvitationMode.LINK;
    role: UserRole.VIEWER;
}
export interface PrivateInvitation extends ShareInvitation {
    mode: InvitationMode.USERS;
}
export interface SharedUser {
    userId: string;
    status: InvitationStatus;
    statusUpdatedAt: Timestamp | null;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    role: UserRole;
}
export type CreatedPublicSharedInvitationDTO = Omit<PublicInvitation, "id" | "createdAt" | "updatedAt">;
export type CreatedPrivateSharedInvitationDTO = Omit<PrivateInvitation, "id" | "createdAt" | "updatedAt">;
export type CreatedChownInvitationDTO = Omit<ChownInvitation, "id" | "createdAt" | "updatedAt">;
export type CreatedAnyInvitationDTO = CreatedPublicSharedInvitationDTO | CreatedPrivateSharedInvitationDTO | CreatedChownInvitationDTO;
export type CreatedSharedUserDTO = Omit<SharedUser, "createdAt" | "updatedAt" | "statusUpdatedAt">;
export type CreatedInvitationDTO = CreatedAnyInvitationDTO;
export type UpdatedInvitationDTO = Partial<Omit<ShareInvitation, "id" | "type" | "targetRef" | "createdAt" | "createdBy">>;
/**
 * Resultado de resolver el acceso de la persona actual (logueada, invitada
 * o anónima) a una invitación. Lo calcula InvitationService.resolveAccess()
 * y lo consume la pantalla de invitación (InvitationGate) para decidir qué
 * mostrar: el panel directamente, un aviso de aceptar/rechazar, o un error.
 */
export type InvitationAccessResult = {
    kind: "public";
    invitation: PublicInvitation;
} | {
    kind: "private-pending";
    invitation: PrivateInvitation;
    sharedUser: SharedUser;
} | {
    kind: "private-accepted";
    invitation: PrivateInvitation;
    sharedUser: SharedUser;
} | {
    kind: "private-rejected";
    invitation: PrivateInvitation;
    sharedUser: SharedUser;
} | {
    kind: "not-invited";
    invitation: PrivateInvitation;
} | {
    kind: "expired" | "revoked" | "not-found";
};
export declare function isChownInvitation(invitation: Invitation): invitation is ChownInvitation;
export declare function isSharedInvitation(invitation: Invitation): invitation is ShareInvitation;
export declare function isPublicSharedInvitation(invitation: Invitation): invitation is PublicInvitation;
export declare function isPrivateSharedInvitation(invitation: Invitation): invitation is PrivateInvitation;
