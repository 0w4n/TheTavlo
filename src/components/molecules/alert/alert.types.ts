import type { HTMLAttributes } from "react";

export type AlertVariant = "info" | "success" | "warning" | "error";

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Visual variant of the alert
   * @default 'info'
   */
  variant?: AlertVariant;

  /**
   * Title of the alert
   */
  title?: string;

  /**
   * Icon to display (if not provided, default icon based on variant)
   */
  icon?: React.ReactNode;

  /**
   * Whether to hide the icon
   */
  hideIcon?: boolean;

  /**
   * Whether the alert can be dismissed
   */
  dismissible?: boolean;

  /**
   * Callback when alert is dismissed
   */
  onDismiss?: () => void;

  /**
   * Content of the alert
   */
  children: React.ReactNode;
}
