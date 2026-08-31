import Icon from "#shared/ui/atoms/icons";
import type { EventCardProps } from "./EventCard.types";

import "./EventCard.css";
import {
  isExamEvent,
  isGenericEvent,
  isMeetingEvent,
  isOtherEvent,
} from "#features/events/domain/events.entity";

export default function EventCard({
  type,
  event,
  size = "medium",
  className,
}: EventCardProps) {
  const classes = `event__card ${type}-card ${size} ${className}`;

  if (isExamEvent(event)) {
    return (
      <div className={classes}>
        <div className="event__card-header">
          <p className="event__card-title">{event.name}</p>
          <Icon
            name="IconCalendar"
            size={size === "small" ? 8 : size === "large" ? 16 : 12}
          />
        </div>
        <p className="event__card-time">{event.time}</p>
      </div>
    );
  }

  if (isGenericEvent(event)) {
    return (
      <div className={classes}>
        <div className="event__card-header">
          <p className="event__card-title">{event.name}</p>
          <Icon
            name="IconCalendar"
            size={size === "small" ? 8 : size === "large" ? 16 : 12}
          />
        </div>
        {event.description && type !== "month" && (
          <p className="event__card-description">{event.description}</p>
        )}
      </div>
    );
  }

  if (isMeetingEvent(event)) {
    return (
      <div className={classes}>
        <div className="event__card-header">
          <p className="event__card-title">{event.name}</p>
          <Icon
            name="IconCalendar"
            size={size === "small" ? 8 : size === "large" ? 16 : 12}
          />
        </div>
        <div>
          <p>{event.location.type === "physical" ? event.location.address : "Virtual Meeting"}</p>
          {event.participants?.map((p, i) => (<p key={i}>{p}</p>))}
        </div>
      </div>
    );
  }

  if (isOtherEvent(event)) {
    return (
      <div className={classes}>
        <div className="event__card-header">
          <p className="event__card-title">{event.name}</p>
          <Icon
            name="IconCalendar"
            size={size === "small" ? 8 : size === "large" ? 16 : 12}
          />
        </div>
        {event.description && type !== "month" && (
          <p className="event__card-description">{event.description}</p>
        )}
      </div>
    );
  }
}
