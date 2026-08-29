import type { HTMLAttributes } from "react";

export type TooltipPosition = "top" | "right" | "bottom" | "left";

export interface TooltipProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "content"> {
  /**
   * Content to display in the tooltip
   */
  content: React.ReactNode;

  /**
   * Position of the tooltip relative to the trigger
   * @default 'top'
   */
  position?: TooltipPosition;

  /**
   * Delay before showing the tooltip (in ms)
   * @default 500
   */
  delay?: number;

  /**
   * Whether the tooltip is disabled
   */
  disabled?: boolean;

  /**
   * Element that triggers the tooltip
   */
  children: React.ReactNode;
}
