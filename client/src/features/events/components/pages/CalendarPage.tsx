import type { AnyEvent } from "../../domain/events.entity";
import { useState } from "react";
import DayCard from "../templates/DayCard/DayCard";
import EventCard from "../templates/EventCard/EventCard";
import MonthView from "./views/MonthView/MonthView";
import { Button } from "#components/atoms/button";

import "./CalendarPage.css";

export type ViewMode = "day" | "week" | "month";

interface CalendarPageProps {
  events: AnyEvent[];
  initialView?: ViewMode;
  initialDate?: Date;
}

const hours = Array.from({ length: 24 }, (_, i) => i);

export default function CalendarPage({
  events,
  initialView = "month",
  initialDate = new Date(),
}: CalendarPageProps) {
  const [view, setView] = useState<ViewMode>(initialView);
  const [currentDate, setCurrentDate] = useState<Date>(initialDate);

  const now = new Date();
  const currentHour = now.getHours();

  const goPrev = () => {
    const newDate = new Date(currentDate);
    if (view === "month") newDate.setMonth(newDate.getMonth() - 1);
    if (view === "week") newDate.setDate(newDate.getDate() - 7);
    if (view === "day") newDate.setDate(newDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const goNext = () => {
    const newDate = new Date(currentDate);
    if (view === "month") newDate.setMonth(newDate.getMonth() + 1);
    if (view === "week") newDate.setDate(newDate.getDate() + 7);
    if (view === "day") newDate.setDate(newDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  const renderEventsForDay = (date: Date) => {
    const dayEvents = events.filter(
      (ev) =>
        ev.start.toDate().toDateString() === date.toDateString() ||
        (ev.start.toDate() <= date && ev.end.toDate() >= date),
    );

    return (
      <div className="day-view">
        {hours.map((hour) => {
          const hourEvents = dayEvents.filter(
            (ev) => ev.start.toDate().getHours() === hour,
          );
          const isCurrentHour =
            date.toDateString() === now.toDateString() && hour === currentHour;

          return (
            <div
              key={hour}
              className={`hour-slot ${isCurrentHour ? "current-hour" : ""}`}
            >
              <div className="hour-label">{hour}:00</div>
              <div className="hour-events">
                {hourEvents.map((ev) => {
                  // const duration =
                  //   (ev.end.toDate().getTime() - ev.start.toDate().getTime()) /
                  //   (1000 * 60 * 60);
                  return (
                    <EventCard
                      key={ev.id}
                      type="day"
                      title={ev.title}
                      description={ev.description}
                      icon={ev.icon}
                      color={ev.color}
                      size="large"
                      className={isCurrentHour ? "current-event" : ""}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const formatDayLabel = (date: Date) => {
    const day = date.getDate();
    const weekday = date
      .toLocaleDateString("es-ES", { weekday: "short" })
      .replace(".", "");
    const month = date
      .toLocaleDateString("es-ES", { month: "short" })
      .replace(".", "");
    return `${weekday}/${day}/${month}`;
  };

  const renderWeek = (date: Date) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      return d;
    });

    return (
      <div className="week-view-grid">
        {/* Header con días */}
        <div className="week-header">
          <div className="hour-label"></div>
          {days.map((d) => (
            <div key={d.toDateString()} className="week-day-header">
              {formatDayLabel(d)}
            </div>
          ))}
        </div>

        {/* Horas */}
        {hours.map((hour) => {
          const isCurrentHour = now.getDay() !== -1 && hour === currentHour; // Highlight current hour
          return (
            <div
              key={hour}
              className={`week-hour-row ${isCurrentHour ? "current-hour" : ""}`}
            >
              <div className="hour-label">{hour}:00</div>
              {days.map((d) => {
                const dayEvents = events.filter(
                  (ev) => ev.start.toDate().getDate() === d.getDate(),
                );
                const hourEvents = dayEvents.filter(
                  (ev) => ev.start.toDate().getHours() === hour,
                );
                return (
                  <div key={d.toDateString()} className="week-hour-slot">
                    {hourEvents.map((ev) => (
                      <EventCard
                        key={ev.id}
                        type="week"
                        title={ev.name}
                        description={ev.description}
                        icon={ev.icon}
                        color={ev.color}
                        size="small"
                        extraClass={isCurrentHour ? "current-event" : ""}
                      />
                    ))}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  };

  const renderMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const startDate = new Date(year, month, 0);
    const days = Array.from({ length: 42 }, (_, i) => {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      return day;
    });

    return (
      <div className="month-view">
        {days.map((d) => (
          <DayCard key={d.toDateString()} day={d}>
            {events
              .filter((ev) => ev.start.toDate().getDate() === d.getDate())
              .map((ev) => (
                <EventCard
                  key={ev.id}
                  type="month"
                  title={ev.title}
                  description={ev.description}
                  icon={ev.icon}
                  color={ev.color}
                  size="small"
                />
              ))}
          </DayCard>
        ))}
      </div>
    );
  };

  return (
    <div className="calendar">
      <div className="calendar__header">
        <div className="calendar__header--navigation">
          <Button
            variant="primary"
            icon={"IconChevronLeft"}
            iconSize={18}
            onClick={goPrev}
          />
          <h2>
            {currentDate.toLocaleDateString("es-ES", {
              month: "long",
              year: "numeric",
              day: view === "day" ? "numeric" : undefined,
            })}
          </h2>
          <Button
            variant="primary"
            icon={"IconChevronRight"}
            iconSize={18}
            onClick={goNext}
          />
        </div>
        <div className="calendar__header--view-selector">
          <Button
            variant="secondary"
            icon={"IconCalendar"}
            iconSize={20}
            onClick={() => setView("day")}
          />
          <Button
            variant="secondary"
            icon={"IconCalendarWeek"}
            iconSize={20}
            onClick={() => setView("week")}
          />
          <Button
            variant="secondary"
            icon={"IconCalendarMonth"}
            iconSize={20}
            onClick={() => setView("month")}
          />
        </div>
      </div>

      {view === "day" && renderEventsForDay(currentDate)}
      {view === "week" && renderWeek(currentDate)}
      {view === "month" && MonthView(currentDate, events)}
    </div>
  );
}
