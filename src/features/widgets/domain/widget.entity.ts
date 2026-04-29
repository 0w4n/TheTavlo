import type { Timestamp } from "firebase/firestore";
import type { Breakpoint, LayoutItem, ResponsiveLayouts } from "react-grid-layout";

export type ResponsiveLayout<B extends Breakpoint = Breakpoint> = Partial<
  Record<B, Omit<LayoutItem, "i">>
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
  | "custom";

export interface Widget {
  id: string;
  type: WidgetType;
  layout: ResponsiveLayouts;
  config: Record<string, any>; // Configuración específica del widget
  isHome: boolean;
  locked: boolean; // Si está bloqueado, no se puede mover
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CreateWidgetDTO {
  type: WidgetType;
  layout: ResponsiveLayout;
  config: Record<string, any>; // Configuración específica del widget
  isHome: boolean;
  locked: boolean; // Si está bloqueado, no se puede mover
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type UpdateWidgetDTO = Partial<Omit<CreateWidgetDTO, "createdAt">>;
