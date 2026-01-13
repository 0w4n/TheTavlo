import React, { useState, useEffect } from "react";
import type { DateTimeBadgeProps } from "./datetimebadge.types";
import "./datetimebadge.css";
import { createPortal } from "react-dom";
import { Rise } from "#components/molecules/rise";

/**
 * DateTimeBadge component - muestra fecha y hora actual
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
  ...props
}) => {
  const [currentDate, setCurrentDate] = useState(initialDate || new Date());
  const [isOpen, setOpen] = useState(false);

  // Update time every second if showLiveTime is true
  useEffect(() => {
    if (!showLiveTime) return;

    const interval = setInterval(
      () => {
        setCurrentDate(new Date());
      },
      showSeconds ? 500 : 15000
    );

    console.log(currentDate);

    return () => clearInterval(interval);
  }, [showLiveTime, showSeconds]);

  // Format functions
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("es-ES", {
      weekday: "short",
      year: "2-digit",
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
      <button
        className={classes}
        onClick={() => setOpen(true)}
        type="button"
        aria-label={`Fecha y hora: ${formatDate(currentDate)} ${formatTime(
          currentDate
        )}${eventCount ? `, ${eventCount} eventos pendientes` : ""}`}
        {...props}
      >
        {/* Event Indicator */}
        {eventCount && eventCount > 0 && (
          <span
            className="datetime-badge__event-indicator"
            aria-label={`${eventCount} eventos`}
          >
            {eventCount}
          </span>
        )}

        {/* Content */}
        <div className="datetime-badge__content">
          <span className="datetime-badge__date">
            {formatDate(currentDate)}
          </span>

          <span className="datetime-badge__time">
            {formatTime(currentDate)}
          </span>
        </div>
      </button>
      
      {isOpen &&
        createPortal(
          <Rise isOpen={isOpen} onClose={() => setOpen(false)} sections={[]} />,
          document.body
        )}
    </>
  );
};

DateTimeBadge.displayName = "DateTimeBadge";
