import React from "react";
import type { BadgeProps } from "./badge.types";
import "./badge.css";
import Icon from "#shared/ui/atoms/icons";
import { getIconWithTaskProgress } from "./utils";

/**
 * Badge component for status indicators, labels, and counts
 *
 * @example
 * ```tsx
 * <Badge variant="success">Activo</Badge>
 * <Badge variant="error" dot>Error</Badge>
 * <Badge variant="primary" icon={<CheckIcon />}>Verificado</Badge>
 * ```
 */
export const Badge: React.FC<BadgeProps> = ({
  variant,
  collapsed = false,
  className = "",
}) => {
  const classes = [
    collapsed ? "badge badge__collapsed" : "badge",
    `badge__${variant}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (collapsed) {
    return (
      <div className={classes}>
        <Icon name={getIconWithTaskProgress(variant)} size={16} stroke="2" />
      </div>
    );
  } else {
    return (
      <div className={classes}>
        <Icon name={getIconWithTaskProgress(variant)} size={16} stroke="2" />
        <span>{variant.toString()}</span>
      </div>
    );
  }
};

Badge.displayName = "Badge";
