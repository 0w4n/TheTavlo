import type { DocumentReference, Timestamp } from "firebase/firestore";

// ─── Enums ───────────────────────────────────────────────────────────────────

export enum InvitationStatus {
  PENDING = "pending", // def
  ACCEPTED = "accepted",
  REJECTED = "rejected",
  EXPIRED = "expired",
  REVOKED = "revoked",
}

export enum InvitationType {
  CHOWN = "chown", // Cambiar propietario
  CHMOD = "chmod", // Cambiar modo
  CHROL = "chrol", // Cambiar rol
  SHARE = "share", // Compartir recurso
}

export enum SharedObjType {
  PANEL = "panel", // def
  TASK = "task",
  NOTES = "notes",
  CALENDAR = "calendar",
  EVENT = "event",
}

export enum UserRole {
  EDITOR = "editor",
  VIEWER = "viewer", // def
}

export enum InvitationMode {
  LINK = "link",
  USERS = "users",
}

// ─── Interfaces Base ─────────────────────────────────────────────────────────

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

// ─── Tipos Específicos de Invitación ─────────────────────────────────────────

export interface ChownInvitation extends Invitation {
  type: InvitationType.CHOWN;
  newOwnerId: string; // ¿A quién le estamos dando la propiedad?
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
  // NOTA FIRESTORE: En lugar de un array aquí, los usuarios vivirán en una
  // subcolección de Firestore usando la interfaz `SharedUser` de abajo.
  // path: invitations/{invitationId}/invitedUsers/{userId}
}

// ─── Sub-colección de Usuarios para Invitaciones Privadas ──────────────────

export interface SharedUser {
  userId: string;
  status: InvitationStatus;
  statusUpdatedAt: Timestamp | null; // Mejor nombre para statusAt
  createdAt: Timestamp;
  updatedAt: Timestamp;
  role: UserRole;
}

// ─── DTOs ──────────────────────────────────────────────────────────────────────────────────────────────

export type CreatePublicSharedInvitationDTO = Omit<
  PublicInvitation,
  "id" | "createdAt" | "updatedAt"
>;
export type CreatePrivateSharedInvitationDTO = Omit<
  PrivateInvitation,
  "id" | "createdAt" | "updatedAt"
>;
export type CreateChownInvitationDTO = Omit<
  ChownInvitation,
  "id" | "createdAt" | "updatedAt"
>;

export type CreateAnyInvitationDTO =
  | CreatePublicSharedInvitationDTO
  | CreatePrivateSharedInvitationDTO
  | CreateChownInvitationDTO;

export type CreateSharedUserDTO = Omit<
  SharedUser,
  "createdAt" | "updatedAt" | "statusUpdatedAt"
>;

// CreateInvitationDTO/UpdateInvitationDTO: alias usados por el repositorio,
// el servicio y el contexto de invitaciones. Antes se importaban sin existir
// (rompía la compilación de toda la feature) — los añadimos aquí para que
// apunten a los DTOs ya modelados arriba en vez de duplicar su forma.
export type CreateInvitationDTO = CreateAnyInvitationDTO;
export type UpdateInvitationDTO = Partial<
  Omit<ShareInvitation, "id" | "type" | "targetRef" | "createdAt" | "createdBy">
>;

/**
 * Resultado de resolver el acceso de la persona actual (logueada, invitada
 * o anónima) a una invitación. Lo calcula InvitationService.resolveAccess()
 * y lo consume la pantalla de invitación (InvitationGate) para decidir qué
 * mostrar: el panel directamente, un aviso de aceptar/rechazar, o un error.
 */
export type InvitationAccessResult =
  | { kind: "public"; invitation: PublicInvitation }
  | {
      kind: "private-pending";
      invitation: PrivateInvitation;
      sharedUser: SharedUser;
    }
  | {
      kind: "private-accepted";
      invitation: PrivateInvitation;
      sharedUser: SharedUser;
    }
  | {
      kind: "private-rejected";
      invitation: PrivateInvitation;
      sharedUser: SharedUser;
    }
  | { kind: "not-invited"; invitation: PrivateInvitation }
  | { kind: "expired" | "revoked" | "not-found" };

// ─── Type Guards ──────────────────────────────────────────────────────────────────────────────────

export function isChownInvitation(
  invitation: Invitation,
): invitation is ChownInvitation {
  return invitation.type === InvitationType.CHOWN;
}

export function isSharedInvitation(
  invitation: Invitation,
): invitation is ShareInvitation {
  return invitation.type === InvitationType.SHARE;
}

export function isPublicSharedInvitation(
  invitation: Invitation,
): invitation is PublicInvitation {
  return (
    invitation.type === InvitationType.SHARE &&
    (invitation as ShareInvitation).mode === InvitationMode.LINK
  );
}

export function isPrivateSharedInvitation(
  invitation: Invitation,
): invitation is PrivateInvitation {
  return (
    invitation.type === InvitationType.SHARE &&
    (invitation as ShareInvitation).mode === InvitationMode.USERS
  );
}
