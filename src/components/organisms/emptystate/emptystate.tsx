import React from "react";
import type { EmptyStateProps } from "./emptystate.types";
import "./emptystate.css";

/**
 * EmptyState component for displaying empty or zero states
 *
 * @example
 * ```tsx
 * <EmptyState
 *   icon={<GridIcon />}
 *   title="No hay widgets"
 *   description="Comienza agregando tu primer widget"
 *   action={<Button>Añadir widget</Button>}
 * />
 * ```
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  secondaryAction,
  size = "md",
  className = "",
  ...props
}) => {
  const classes = ["empty-state", `empty-state--${size}`, className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} {...props}>
      {/* Icon */}
      {icon && (
        <div className="empty-state__icon" aria-hidden="true">
          {icon}
        </div>
      )}

      {/* Title */}
      <h2 className="empty-state__title">{title}</h2>

      {/* Description */}
      {description && <p className="empty-state__description">{description}</p>}

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="empty-state__actions">
          {secondaryAction}
          {action}
        </div>
      )}
    </div>
  );
};

EmptyState.displayName = "EmptyState";
