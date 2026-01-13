import type { HTMLAttributes } from "react";

export interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Icon to display (SVG or React component)
   */
  icon?: React.ReactNode;

  /**
   * Title text
   */
  title: string;

  /**
   * Description text
   */
  description?: string;

  /**
   * Primary action button
   */
  action?: React.ReactNode;

  /**
   * Secondary action button
   */
  secondaryAction?: React.ReactNode;

  /**
   * Size of the empty state
   * @default 'md'
   */
  size?: "sm" | "md" | "lg";
}
