import type { DocumentReference, Timestamp } from "firebase/firestore";
import type { AccountType } from "#core/auth/domain/user.entity";

export interface Panel {
  id: string;
  parentId: DocumentReference | null;
  name: string;
  color: number;
  icon: string;
  sharedWith: DocumentReference | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  ownerId?: string;
  ownerAccountType?: AccountType;
}

export type CreatePanelDTO = Omit<Panel, "id" | "ownerId" | "ownerAccountType">;
export type UpdatePanelDTO = Partial<Omit<CreatePanelDTO, "createdAt">>;
