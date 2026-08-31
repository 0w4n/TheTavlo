import type { TaskProgress } from "#features/task/domain/task.entity";

export interface BadgeProps {
  variant: TaskProgress;
  collapsed: boolean;
  className?: string;
}
