import { TaskProgress } from "#features/task/domain/task.entity";
export function getIconWithTaskProgress(taskProgress) {
    switch (taskProgress) {
        case (taskProgress = TaskProgress.NOTSTARTED):
            return "IconCircleDashed";
        case (taskProgress = TaskProgress.INPROGRESS):
            return "IconLoader";
        case (taskProgress = TaskProgress.SUBMITTED):
            return "IconCheck";
        // case TaskProgress.delayed:
        //   return "IconCalendarTime";
        default:
            return "IconHelp";
    }
}
