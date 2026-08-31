import { err, ok, validationErr, type AppErr, type ResultApp } from "#core/appCore/domain/AppCore.type";
import { TaskProgress, type Task } from "./task.entity";

export class TaskRules {
  static canComplete(task: Task): boolean {
    return task.progress !== TaskProgress.SUBMITTED;
  }

  static isOverdue(task: Task): boolean {
    return task.endAt.toDate() < new Date();
  }

  static validateTitle(title: string): ResultApp<string, AppErr> {
    if (!title || title.trim().length === 0) {
      return err(validationErr("El título es requerido"));
    }
    if (title.length > 100) {
      return err(validationErr("El título no puede exceder 100 caracteres"));
    }
    return ok(title);
  }

  static validateDueDate(date: Date): ResultApp<Date, AppErr> {
    if (date < new Date()) {
      return err(validationErr("La fecha de vencimiento no puede ser en el pasado"));
    }
    return ok(date);
  }
}
