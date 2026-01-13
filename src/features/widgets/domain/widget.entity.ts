import type { Timestamp } from "firebase/firestore";

export type WidgetType =
  | "task-list"
  | "panels-list"
  | "event-calendar"
  | "event-list"
  | "exam-timeline"
  | "exam-countdown"
  | "statistics"
  | "quick-add"
  | "recent-activity"
  | "upcoming-deadlines"
  | "productivity-chart"
  | "notes"
  | "custom";

export interface WidgetLayout {
  x: number; // Posición horizontal (columna)
  y: number; // Posición vertical (fila)
  w: number; // Ancho en unidades de grid
  h: number; // Alto en unidades de grid
  minW?: number; // Ancho mínimo
  minH?: number; // Alto mínimo
  maxW?: number; // Ancho máximo
  maxH?: number; // Alto máximo
}

export interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  layout: WidgetLayout;
  config: Record<string, any>; // Configuración específica del widget
  isHome: boolean;
  locked: boolean; // Si está bloqueado, no se puede mover
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type CreateWidgetDTO = Omit<Widget, "id">;
export type UpdateWidgetDTO = Partial<Omit<Widget, "id" | "createdAt">>;
