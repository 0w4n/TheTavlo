import type { DocumentReference, Timestamp } from "firebase/firestore";

export interface Panel {
  id: string;
  parentId?: string;
  name: string;
  color: number;
  icon: string;
  isDefault: boolean;
  subPanelsId: DocumentReference[];
  sharedWith: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type CreatePanelDTO = Omit<Panel, "id" | "parentId">;
export type UpdatePanelDTO = Partial<Omit<Panel, "id" | "parentId" | "createdAt">>;
