import type { DocumentReference, Timestamp } from "firebase/firestore";

export enum statusInvitation {
  PENDING = "pending",
  ACCEPTED = "accepted",
  REJECTED = "rejected",
  EXPIRED = "expired",
}

export enum userRole {
  EDITOR = "editor",
  VIEWER = "viewer",
}

export enum visibility {
  PUBLIC = "public",
  PRIVATE = "private",
}

export interface Invitation {
  id: string;
  objRef: DocumentReference;
  ownerId: string;
  token: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  grantedAt: Timestamp;
  grantedBy: string;
  sharedUser: Map<number, sharedUser>;
  /**
   * La visibilidad de la invitación, puede ser "public" o "private"
   * @default "private"
   */
  sharedVisibility: visibility;
  sharedRef: DocumentReference;
}

export interface sharedUser {
  userId: string;
  /**
   * El estado de la invitación para este usuario, puede ser "pending", "accepted" o "rejected"
   * @default "pending"
   */
  status: statusInvitation;
  statusAt: Timestamp;
  updatedAt: Timestamp;
  /**
   * El rol del usuario en la invitación, puede ser "editor" o "viewer"
   * @default "editor"
   */
  role: userRole;
}

export interface CreatedSharedUserDTO {
  userId: string;
  role: userRole;
}

export interface CreateInvitationDTO{  
  ownerId: string;
  token: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  sharedUser: Map<number, CreatedSharedUserDTO>;
}

export type UpdateInvitationDTO = Omit<CreateInvitationDTO, "createdAt" | "token">;
