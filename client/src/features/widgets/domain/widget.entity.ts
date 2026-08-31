import type { Timestamp } from "firebase/firestore";
import type { Breakpoint, LayoutItem } from "react-grid-layout";

export type ResponsiveLayout<B extends Breakpoint = Breakpoint> = Record<
  B,
  Omit<LayoutItem, "i">
>;

export type LayoutItemDTO = Omit<
  LayoutItem,
  | "i"
  | "isDraggable"
  | "isResizable"
  | "resizeHandles"
  | "static"
  | "isBounded"
  | "constraints"
>;

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
  | "cooking-book"
  | "custom";

export interface Widget {
  id: string;
  type: WidgetType;
  layout: Record<Breakpoint, LayoutItemDTO>;
  config: Record<string, any>; // Configuración específica del widget
  locked: boolean; // Si está bloqueado, no se puede mover
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type CreateWidgetDTO = Omit<Widget, "id">

export type UpdateWidgetDTO = Partial<Omit<CreateWidgetDTO, "createdAt">>;
