import Icon from "#shared/ui/atoms/icons";
import type { Timestamp } from "firebase/firestore";
import type {
  ExamsTimelineWidgetProps,
  ExamTimelineItemProps,
} from "./examsTimelineWidget.types";

import "./examsTimelineWidget.css";

export function ExamsTimelineWidget({ items }: ExamsTimelineWidgetProps) {
  return <>{items.map((item) => examTimelineItem(item))}</>;
}

function examTimelineItem({
  color,
  examAssignatureName,
  examDate,
  icon,
  examId,
}: ExamTimelineItemProps) {
  const darkColor = getIconColor(color);

  return (
    <div key={examId} className="exams-timeline-widget-item" style={{backgroundColor: darkColor}}>
      <div className="exams-timeline-widget-item__date" style={{border: `2px solid ${color}`}}>
        {TimestampToString(examDate)}
      </div>
      <div className="exams-timeline-widget-item__content">
        <div
          className="exams-timeline-widget-item__content--icon"
          style={{ backgroundColor: color }}
        >
          <Icon name={icon} color={darkColor} />
        </div>
        <span className="exams-timeline-widget-item__content--assignature-name">
          {examAssignatureName}
        </span>
      </div>
    </div>
  );
}

function getIconColor(color: string) {
  return color.replace("70%", "30%");}

function TimestampToString(timestamp: Timestamp) {
  const date = timestamp.toDate();
  const diff = date.getTime() - new Date().getTime();
  console.log(diff);
  const interClassName = "exams-timeline-widget-item__date--text";

  if (diff < 1) return <span className={interClassName}>Hoy</span>;
  else if (diff > 2)
    return (
      <>
        <span className={interClassName}> 1 Día </span>
      </>
    );
  else
    return (
      <>
        <span className={interClassName}> {diff} Días </span>
      </>
    );
}
