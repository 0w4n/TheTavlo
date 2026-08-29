import type { HTMLAttributes } from "react";

export type DateTimeBadgeVariant = "default" | "compact" | "detailed";

export interface DateTimeBadgeProps extends HTMLAttributes<HTMLButtonElement> {
  /**
   * The date to display (defaults to current date)
   */
  date?: Date;

  /**
   * Visual variant
   * @default 'default'
   */
  variant?: DateTimeBadgeVariant;

  /**
   * Whether to show live time
   * @default true
   */
  showLiveTime?: boolean;

  /**
   * Whether to show seconds
   * @default false
   */
  showSeconds?: boolean;

  /**
   * Callback when clicked
   */
  onClick?: () => void;

  /**
   * Whether the badge is interactive (clickable)
   * @default true
   */
  interactive?: boolean;

  /**
   * Number of pending events (shows badge indicator)
   */
  eventCount?: number;
}
