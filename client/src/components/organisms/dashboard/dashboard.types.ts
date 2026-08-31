import type { Widget } from "#features/widgets/domain/widget.entity";
import type { HTMLAttributes } from "react";

export interface DashboardProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Whether to show the empty state
   * @default true
   */
  isEmpty?: boolean;

  /**
   * Dashboard content (when not empty)
   */
  widgetList: Widget[];

  editMode: boolean;
}
