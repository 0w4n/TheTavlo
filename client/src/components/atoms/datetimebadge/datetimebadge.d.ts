import React from "react";
import type { DateTimeBadgeProps } from "./datetimebadge.types";
import "./datetimebadge.css";
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
export declare const DateTimeBadge: React.FC<DateTimeBadgeProps>;
