import type { Timestamp } from "firebase/firestore";

export interface ExamsTimelineWidgetProps {
  items: ExamTimelineItemProps[];
}

export interface ExamTimelineItemProps {
  id: string;
  examAssignatureName: string;
  examDate: Timestamp;
}
