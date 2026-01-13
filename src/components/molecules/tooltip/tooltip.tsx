import React, { useState, useRef, useEffect } from "react";
import type { TooltipProps } from "./tooltip.types";
import "./Tooltip.css";

/**
 * Tooltip component for contextual information
 *
 * @example
 * ```tsx
 * <Tooltip content="Este es un tooltip informativo" position="top">
 *   <Button>Hover me</Button>
 * </Tooltip>
 *
 * <Tooltip content="Ayuda adicional" position="right" delay={300}>
 *   <Icon name="help" />
 * </Tooltip>
 * ```
 */

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  position = "top",
  delay = 500,
  disabled = false,
  children,
  className = "",
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tooltipId = useRef(
    `tooltip-${Math.random().toString(36)}`
  );

  // Show tooltip con delay
  const handleMouseEnter = () => {
    if (disabled) return;

    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  // Hide tooltip
  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsVisible(false);
  };

  // Show tooltip on focus
  const handleFocus = () => {
    if (disabled) return;
    setIsVisible(true);
  };

  // Hide tooltip on blur
  const handleBlur = () => {
    setIsVisible(false);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const containerClasses = ["tooltip", className].filter(Boolean).join(" ");

  return (
    <div className={containerClasses} {...props}>
      {/* Trigger */}
      <div
        className="tooltip__trigger"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        aria-describedby={isVisible ? tooltipId.current : undefined}
      >
        {children}
      </div>

      {/* Tooltip Content */}
      {isVisible && !disabled && (
        <div
          id={tooltipId.current}
          className={`tooltip__content tooltip__content--${position}`}
          role="tooltip"
        >
          {content}
          <div className="tooltip__arrow" />
        </div>
      )}
    </div>
  );
};

Tooltip.displayName = "Tooltip";
