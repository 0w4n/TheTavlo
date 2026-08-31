import type { AnyEvent } from "#features/events/domain/events.entity";
import DayCard from "../../../templates/DayCard/DayCard";
import EventCard from "../../../templates/EventCard/EventCard";

import "./MonthView.css";

export default function MonthView(currentDate: Date, events: AnyEvent[]) {
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1,
  );

  const startDate = new Date(firstDayOfMonth);
  const dayOfWeek = firstDayOfMonth.getDay();
  const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Monday = 0
  startDate.setDate(firstDayOfMonth.getDate() - daysToSubtract);

  const days = Array.from({ length: 35 }, (_, i) => {
    const day = new Date(startDate);
    day.setDate(startDate.getDate() + i);
    return day;
  });

  console.log(days);

  const weekDays = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

  return (
    <div className="month-view">
      {weekDays.map((day, index) => (
        <div key={index} className="DateCard">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {day}
          </span>
        </div>
      ))}
      {days.map((d) => (
        <DayCard key={d.toDateString()} day={d}>
          {events
            .filter((ev) => {
              const startAt = \"startAt\" in ev ? ev.startAt.toDate() : null;
              return startAt?.getDate() === d.getDate();
            })
            .map((ev) => (
              <EventCard
                key={ev.id}
                type="month"
                event={ev}
                size="small"
              />
            ))}
        </DayCard>
      ))}
    </div>
  );
}
