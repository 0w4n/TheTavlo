import type { AnyEvent } from "#features/events/domain/events.entity";
import type { ViewMode } from "../../pages/CalendarPage";

export interface EventCardProps {
  type: ViewMode;
  event: AnyEvent;
  size?: "small" | "medium" | "large";
  className?: string;
}