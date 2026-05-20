import Icon from "#shared/ui/atoms/icons";
import type { Timestamp } from "firebase/firestore";
import type { ExamTimelineItemProps } from "./examsTimelineWidget.types";

import "./examsTimelineWidget.css";
import { useEvents } from "#features/events/presentation/hooks/useEvents";
import LoadingPage from "#components/pages/LoadingPage";
import type { ExamEvent } from "#features/events/domain/events.entity";

export default function ExamsTimelineWidget() {
  const { state } = useEvents();

  if (state.loading) {
    <LoadingPage />;
  } else if (state.event.length === 0) {
    return <span>No hay nada</span>;
  } else {
    const items = state.event as unknown as ExamEvent[];

    return (
      <>
        {items.map((item) =>
          examTimelineItem({
            examDate: item.makeAt,
            id: item.id,
            examAssignatureName: item.name
          }),
        )}
      </>
    );
  }
}

function examTimelineItem({
  examAssignatureName,
  examDate,
  id,
}: ExamTimelineItemProps) {
  const color = "hsl(34, 100%, 70%)";
  const darkColor = getIconColor(color);

  return (
    <div
      key={id}
      className="exams-timeline-widget-item"
      style={{ backgroundColor: darkColor }}
    >
      <div
        className="exams-timeline-widget-item__date"
        style={{ border: `2px solid ${color}` }}
      >
        {TimestampToString(examDate)}
      </div>
      <div className="exams-timeline-widget-item__content">
        <div
          className="exams-timeline-widget-item__content--icon"
          style={{ backgroundColor: color }}
        >
          <Icon name={"IconBriefcase"} color={darkColor} />
        </div>
        <span className="exams-timeline-widget-item__content--assignature-name">
          {examAssignatureName}
        </span>
      </div>
    </div>
  );
}

function getIconColor(color: string) {
  return color.replace("70%", "25%");
}

function TimestampToString(timestamp: Timestamp) {
  const date = timestamp.toDate().getTime();
  const now = new Date().setHours(23, 59, 59, 0);
  const diff = date - now;
  console.log("Ahora", now, ", fecha: ", date, ", diff:", diff);
  const interClassName = "exams-timeline-widget-item__date--text";

  if (diff === 0) return <span className={interClassName}>Hoy</span>;
  else {
    const days = diff / 86400000;
    console.log("Days: ", days);

    let innerText = "";

    if (days < 7) innerText = `${days} D`; // 1–6 días
    else if (days < 30) innerText = `${Math.floor(days / 7)} S`; // semanas
    else if (days < 365) innerText = `${Math.floor(days / 30)} M`; // meses
    else innerText = `${Math.floor(days / 365)} A`; // años

    return (
      <>
        <span className={interClassName}> {innerText} </span>
      </>
    );
  }
}
