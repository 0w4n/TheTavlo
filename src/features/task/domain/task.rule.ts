import { TaskProgress, type Task } from "./task.entity";

export class TaskRules {
  static canComplete(task: Task): boolean {
    return task.progress !== TaskProgress.SUBMITTED;
  }

  static isOverdue(task: Task): boolean {
    return task.endAt.toDate() < new Date();
  }

  static validateTitle(title: string): string | null {
    if (!title || title.trim().length === 0) {
      return "El título es requerido";
    }
    if (title.length > 100) {
      return "El título no puede exceder 100 caracteres";
    }
    return null;
  }

  static validateDueDate(date: Date): string | null {
    if (date < new Date()) {
      return "La fecha de vencimiento no puede ser en el pasado";
    }
    return null;
  }
}
