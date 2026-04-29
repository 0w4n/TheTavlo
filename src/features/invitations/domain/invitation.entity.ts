import type { DocumentReference, Timestamp } from "firebase/firestore";

export enum statusinvitation {
  PENDING = "pending",
  ACCEPTED = "accepted",
  REJECTED = "rejected",
}

export enum userRole {
  EDITOR = "editor",
  VIEWER = "viewer",
}

export interface Invitation {
  id: string;
  objRef: DocumentReference;
  ownerId: string;
  token: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  sharedUser: Map<number, sharedUser>;
}

export interface sharedUser {
  userId: string;
  /**
   * El estado de la invitación para este usuario, puede ser "pending", "accepted" o "rejected"
   * @default "pending"
   */
  status: statusinvitation;
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

export type UpdateInvitationDTO = Omit<CreateInvitationDTO, "createdAt">;
