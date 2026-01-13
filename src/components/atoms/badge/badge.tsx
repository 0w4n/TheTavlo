import React from 'react';
import type { BadgeProps } from './badge.types';
import './badge.css';

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
  variant = 'neutral',
  size = 'md',
  icon,
  dot = false,
  children,
  className = '',
  ...props
}) => {
  const classes = [
    'badge',
    `badge--${variant}`,
    `badge--${size}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <span className={classes} {...props}>
      {/* Dot indicator */}
      {dot && <span className="badge__dot" aria-hidden="true" />}
      
      {/* Icon */}
      {icon && (
        <span className="badge__icon" aria-hidden="true">
          {icon}
        </span>
      )}
      
      {/* Content */}
      {children}
    </span>
  );
};

Badge.displayName = 'Badge';
