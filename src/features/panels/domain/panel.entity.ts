import type { Timestamp } from "firebase/firestore";

export type PanelColor =
  | "blue"
  | "green"
  | "purple"
  | "orange"
  | "red"
  | "pink"
  | "gray";

export interface Panel {
  id: string,
  name: string;
  color: PanelColor;
  icon?: string;
  isDefault: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;

  // Estadísticas (calculadas)
  stats?: {
    totalTasks: number;
    completedTasks: number;
    totalEvents: number;
    totalExams: number;
    upcomingExams: number;
  };
}

export type CreatePanelDTO = Omit<
  Panel,
  "id" | "userId" | "createdAt" | "updatedAt" | "stats"
>;
export type UpdatePanelDTO = Partial<
  Omit<Panel, "id" | "userId" | "createdAt" | "stats">
>;
