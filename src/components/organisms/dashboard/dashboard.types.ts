import type { HTMLAttributes } from "react";

export interface DashboardProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Whether to show the empty state
   * @default true
   */
  isEmpty?: boolean;

  /**
   * Custom empty state content
   */
  emptyState?: React.ReactNode;

  /**
   * Dashboard content (when not empty)
   */
  children?: React.ReactNode;
}
