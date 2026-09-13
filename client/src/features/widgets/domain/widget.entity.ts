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

// A propósito NO es una unión de literales ("task-list" | "notes" | ...).
// Ese enum central obligaba a tocar este archivo cada vez que se agregaba
// un widget nuevo — justo lo que el WidgetRegistry (ver #core/widgets)
// existe para eliminar. El identificador válido en la práctica es
// cualquier `type` que un widget haya registrado vía su propio
// `*.widget.meta.ts`; `widgetRegistry.has(type)` es la única fuente de
// verdad real en runtime — este alias solo documenta la intención.
export type WidgetType = string;

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
