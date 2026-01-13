import { Timestamp } from "firebase/firestore";
import type { CreateTaskDTO, Task, UpdateTaskDTO } from "../domain/task.entity";
import { TaskRules } from "../domain/task.rule";
import type { TaskRepository } from "./taskRepository.interface";

export class TasksService {
  constructor(private repository: TaskRepository) {}

  async getAllTasks(): Promise<Task[]> {
    return this.repository.findAll();
  }

  async getTaskById(id: string): Promise<Task | null> {
    return this.repository.findById(id);
  }

  async createTask(
    data: CreateTaskDTO
  ): Promise<{ task?: Task; error?: string }> {
    // Validaciones de negocio
    const titleError = TaskRules.validateTitle(data.title);
    if (titleError) {
      return { error: titleError };
    }

    const dateError = TaskRules.validateDueDate(data.dueDate.toDate());
    if (dateError) {
      return { error: dateError };
    }

    try {
      const task = await this.repository.create(data);
      return { task };
    } catch (error) {
      return { error: "Error al crear la tarea" };
    }
  }

  async updateTask(
    id: string,
    data: UpdateTaskDTO
  ): Promise<{ task?: Task; error?: string }> {
    if (data.title) {
      const titleError = TaskRules.validateTitle(data.title);
      if (titleError) return { error: titleError };
    }

    if (data.dueDate) {
      const dateError = TaskRules.validateDueDate(data.dueDate.toDate());
      if (dateError) return { error: dateError };
    }

    try {
      const task = await this.repository.update(id, data);
      return { task };
    } catch (error) {
      return { error: "Error al actualizar la tarea" };
    }
  }

  async completeTask(id: string): Promise<{ task?: Task; error?: string }> {
    const existingTask = await this.repository.findById(id);

    if (!existingTask) {
      return { error: "Tarea no encontrada" };
    }

    if (!TaskRules.canComplete(existingTask)) {
      return { error: "La tarea ya está completada" };
    }

    return this.updateTask(id, { status: "submitted", updatedAt: Timestamp.fromDate(new Date()) });
  }

  async deleteTask(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      await this.repository.delete(id);
      return { success: true };
    } catch (error) {
      return { success: false, error: "Error al eliminar la tarea" };
    }
  }

  async getOverdueTasks(): Promise<Task[]> {
    const tasks = await this.repository.findAll();
    return tasks.filter((task: Task) => TaskRules.isOverdue(task));
  }

  async getTasksByPriority(priority: Task["priority"]): Promise<Task[]> {
    const tasks = await this.repository.findAll();
    return tasks.filter((task: { priority: string; }) => task.priority === priority);
  }
}
