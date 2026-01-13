import type { Task, TaskStatus } from "./task.entity";

export class TaskRules {
  static canComplete(task: Task): boolean {
    return !task.status;
  }

  static isOverdue(task: Task): boolean {
    return task.dueDate.toDate() < new Date();
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

export class TaskStatusRules {
  static readonly STATUS_CONFIG: Record<
    TaskStatus,
    {
      label: string;
      backgroundColor: string;
      borderColor: string;
      textColor: string;
    }
  > = {
    "not-started": {
      label: "No comenzada",
      backgroundColor: "#e0e0e0",
      borderColor: "#9e9e9e",
      textColor: "#9e9e9e",
    },
    "in-progress": {
      label: "En progreso",
      backgroundColor: "#fff9c4",
      borderColor: "#f9a825",
      textColor: "#f9a825",
    },
    submitted: {
      label: "Enviada",
      backgroundColor: "#c8e6c9",
      borderColor: "#43a047",
      textColor: "#43a047",
    },
    delayed: {
      label: "Retrasada",
      backgroundColor: "#ffcdd2",
      borderColor: "#e53935",
      textColor: "#e53935",
    },
  };

  static readonly STATUS_ORDER: TaskStatus[] = [
    "not-started",
    "in-progress",
    "submitted",
    "delayed",
  ];

  static getStatusConfig(status: TaskStatus) {
    return this.STATUS_CONFIG[status];
  }

  static getNextStatus(currentStatus: TaskStatus): TaskStatus {
    const currentIndex = this.STATUS_ORDER.indexOf(currentStatus);
    const nextIndex = (currentIndex + 1) % this.STATUS_ORDER.length;
    return this.STATUS_ORDER[nextIndex];
  }

  static getPreviousStatus(currentStatus: TaskStatus): TaskStatus {
    const currentIndex = this.STATUS_ORDER.indexOf(currentStatus);
    const prevIndex =
      currentIndex === 0 ? this.STATUS_ORDER.length - 1 : currentIndex - 1;
    return this.STATUS_ORDER[prevIndex];
  }

  static shouldAutoSetDelayed(task: Task): boolean {
    const now = new Date();
    return task.status !== "submitted" && task.dueDate.toDate() < now;
  }

  static getDefaultStatus(): TaskStatus {
    return "not-started";
  }
}
