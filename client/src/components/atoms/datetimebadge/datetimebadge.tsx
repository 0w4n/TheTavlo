import React, { useState, useEffect } from "react";
import type { DateTimeBadgeProps } from "./datetimebadge.types";
import "./datetimebadge.css";
import { Button } from "../button";

/**
 * DateTimeBadge component - muestra fecha y hora actual.
 * Al hacer click, abre el componente Rise
 *
 * @example
 * ```tsx
 * <DateTimeBadge
 *   variant="detailed"
 *   showLiveTime
 *   eventCount={3}
 * />
 * ```
 */
export const DateTimeBadge: React.FC<DateTimeBadgeProps> = ({
  date: initialDate,
  variant = "default",
  showLiveTime = true,
  showSeconds = false,
  interactive = true,
  eventCount,
  className = "",
  onClick,
  ...props
}) => {
  const [currentDate, setCurrentDate] = useState(initialDate || new Date());

  // Update time every second if showLiveTime is true
  useEffect(() => {
    if (!showLiveTime) return;

    const interval = setInterval(
      () => {
        setCurrentDate(new Date());
      },
      showSeconds ? 500 : 15000
    );

    return () => clearInterval(interval);
  }, [showLiveTime, showSeconds]);

  // Format functions
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("es-ES", {
      weekday: "short",
      day: "2-digit"
    });
  };

  const formatTime = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
      ...(showSeconds && { second: "2-digit" }),
    };
    return date.toLocaleTimeString("es-ES", options);
  };

  const classes = [
    "datetime-badge",
    `datetime-badge--${variant}`,
    interactive && "datetime-badge--interactive",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <Button
        className={classes}
        onClick={onClick}
        variant="primary"
        {...props}
      >
        {/* Content */}
        <div className="datetime-badge__content">
          <span className="datetime-badge__date">
            {formatDate(currentDate)}
          </span>

          <span className="datetime-badge__time">
            {formatTime(currentDate)}
          </span>
        </div>
      </Button>
    </>
  );
};

DateTimeBadge.displayName = "DateTimeBadge";
