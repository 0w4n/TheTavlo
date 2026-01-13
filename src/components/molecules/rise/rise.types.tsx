import type { HTMLAttributes } from "react";

export type RiseItemType = "task" | "event" | "meeting" | "deadline";
export type RisePriority = "low" | "medium" | "high" | "urgent";
export type RiseStatus = "pending" | "in-progress" | "completed" | "overdue";

export interface RiseItem {
  id: string;
  type: RiseItemType;
  title: string;
  description?: string;
  time?: string;
  duration?: string;
  priority?: RisePriority;
  status?: RiseStatus;
  location?: string;
  attendees?: string[];
  tags?: string[];
  dueDate?: Date;
  completedAt?: Date;
}

export interface RiseSection {
  title: string;
  items: RiseItem[];
  icon?: React.ReactNode;
  color?: string;
}

export interface RiseProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Whether the Rise panel is open
   */
  isOpen: boolean;

  /**
   * Callback when panel should close
   */
  onClose: () => void;

  /**
   * Date to show recap for (defaults to today)
   */
  date?: Date;

  /**
   * Sections with items
   */
  sections: RiseSection[];

  /**
   * Callback when an item is clicked
   */
  onItemClick?: (item: RiseItem) => void;

  /**
   * Callback when item status changes
   */
  onItemStatusChange?: (itemId: string, newStatus: RiseStatus) => void;

  /**
   * Whether to show completed items
   * @default true
   */
  showCompleted?: boolean;

  /**
   * Custom header content
   */
  headerContent?: React.ReactNode;
}

export interface RiseSectionProps extends HTMLAttributes<HTMLElement> {
  section: RiseSection;
  onItemClick?: (item: RiseItem) => void;
  onItemStatusChange?: (itemId: string, newStatus: RiseStatus) => void;
  showCompleted?: boolean;
}

export interface RiseItemProps extends Omit<HTMLAttributes<HTMLDivElement>, "onClick"> {
  item: RiseItem;
  onClick?: (item: RiseItem) => void; // ahora es tu firma personalizada
  onStatusChange?: (itemId: string, newStatus: RiseStatus) => void;
}

