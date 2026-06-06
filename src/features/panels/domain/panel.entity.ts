import type { DocumentReference, Timestamp } from "firebase/firestore";

export interface Panel {
  id: string;
  parentId?: DocumentReference;
  name: string;
  color: number;
  icon: string;
  sharedWith?: DocumentReference;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type CreatePanelDTO = Omit<Panel, "id">;
export type UpdatePanelDTO = Partial<Omit<Panel, "id" | "createdAt">>;
