import type { Timestamp } from "firebase/firestore";

export interface ExamsTimelineWidgetProps {
  items: ExamTimelineItemProps[];
}

export interface ExamTimelineItemProps {
  examId: string;
  examAssignatureName: string;
  icon: string;
  color: string;
  examDate: Timestamp;
}
