import { Button } from "#components/atoms/button";
import type { DayCardProps } from "./DayCard.type";

import "./DayCard.css";

export default function DayCard({
  day,
  children,
}: DayCardProps) {
  const now = new Date();
  const format = new Intl.DateTimeFormat("es-ES", { month: "long" });

  const isToday =
    day.getMonth() === now.getMonth() && day.getDate() === now.getDate();

  const isCurrentMonth = day.getMonth() === now.getMonth();

  return (
    <div className={`daycard ${isToday ? "today" : ""} ${isCurrentMonth ? "" : "not-current-month"}`}>
      <div className="daycard__header">
        <span>{day.getDate()}</span>
        <Button variant="ghost" size="sm" type="button" icon={"IconPlus"} iconSize={10} className={"daycard__header-addEvent"}/>
      </div>
      {children ? <div className="event-container">{children}</div> : null}
      {1 == day.getDate() ? (
        <div className="day-footer">
          <span>{format.format(day)}</span>
        </div>
      ) : null}
    </div>
  );
}
