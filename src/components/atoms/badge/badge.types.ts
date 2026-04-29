export type BadgeVariant =
  | "success"
  | "error"
  | "warning"
  | "info"
  | "primary"
  | "neutral";
  
export type BadgeSize = "sm" | "md" | "lg";

export interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: React.ReactNode;
  dot?: boolean;
  className?: string;
  children?: React.ReactNode;
}
