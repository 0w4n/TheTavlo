import { Timestamp } from "firebase/firestore";
import {
  TaskProgress,
  type Task,
  type CreateAnyTaskDTO,
  type UpdateAnyTaskDTO,
  type AnyTask
} from "../domain/task.entity";
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

  async createAnyTask(
    data: CreateAnyTaskDTO,
  ): Promise<{ task?: AnyTask; error?: string }> {
    // Validaciones de negocio
    const titleError = TaskRules.validateTitle(data.title);
    if (titleError) {
      return { error: titleError };
    }

    // const dateError = TaskRules.validateDueDate(data..toDate());
    // if (dateError) {
    //   return { error: dateError };
    // }

    try {
      const task = await this.repository.create(data);
      return { task };
    } catch (error) {
      return { error: "Error al crear la tarea" };
    }
  }

  async updateAnyTask(
    id: string,
    data: UpdateAnyTaskDTO,
  ): Promise<{ task?: AnyTask; error?: string }> {
    if (data.title) {
      const titleError = TaskRules.validateTitle(data.title);
      if (titleError) return { error: titleError };
    }

    if (data.endAt) {
      const dateError = TaskRules.validateDueDate(data.endAt.toDate());
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

    return this.updateAnyTask(id, {
      progress: TaskProgress.SUBMITTED,
      updatedAt: Timestamp.now(),
    });
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

  async getTasksByPriority(priority: Task["progress"]): Promise<Task[]> {
    const tasks = await this.repository.findAll();
    return tasks.filter(
      (task: { priority: string }) => task.priority === priority,
    );
  }
}
