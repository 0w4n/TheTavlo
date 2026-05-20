import { Timestamp } from "firebase/firestore";
import {
  TaskProgress,
  type Task,
  type CreateAnyTaskDTO,
  type UpdateAnyTaskDTO,
  type AnyTask,
  isTask,
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
  ): Promise< AnyTask | Error> {
    // Validaciones de negocio
    const titleError = TaskRules.validateTitle(data.title);
    if (titleError) {
      return Error(titleError);
    }

    // const dateError = TaskRules.validateDueDate(data..toDate());
    // if (dateError) {
    //   return { error: dateError };
    // }

    try {
      const task = await this.repository.create(data);
      return task;
    } catch (error) {
      return Error("Error al crear la tarea");
    }
  }

  async updateAnyTask(
    id: string,
    data: UpdateAnyTaskDTO,
  ): Promise<AnyTask | Error> {
    if (data.title) {
      const titleError = TaskRules.validateTitle(data.title);
      if (titleError) return Error(titleError);
    }

    if (data.endAt) {
      const dateError = TaskRules.validateDueDate(data.endAt.toDate());
      if (dateError) return Error(dateError);
    }

    try {
      const task = await this.repository.update(id, data);
      return task;
    } catch (error) {
      return Error("Error al actualizar la tarea");
    }
  }

  async completeTask(id: string): Promise<Task | Error> {
    const existingTask = await this.repository.findById(id);

    if (!existingTask) return Error("Tarea no encontrada");
    if (!TaskRules.canComplete(existingTask)) return Error("La tarea ya está completada");
    if (isTask(existingTask)) {
      const res = await this.updateAnyTask(id, {
        progress: TaskProgress.SUBMITTED,
        updatedAt: Timestamp.now(),
      });

      if (res instanceof Error) return Error("Algo");
      if (isTask(res)) return res;

      return Error(
        "Error inesperado: el resultado de la actualización no es válido",
      );
    } else {
      return Error(
        `El id ${id} de la tarea me devuelve una interfaz no válida`,
      );
    }
  }

  async deleteTask(id: string): Promise<boolean | Error> {
    try {
      await this.repository.delete(id);
      return true;
    } catch (error) {
      return Error(`Error al eliminar la tarea, con  el id: ${id}`);
    }
  }

  async getOverdueTasks(): Promise<Task[]> {
    const tasks = await this.repository.findAll();
    return tasks.filter((task: Task) => TaskRules.isOverdue(task));
  }

  async getTasksByProgress(progress: TaskProgress): Promise<Task[]> {
    const tasks = await this.repository.findAll();
    return tasks.filter(
      (task: { progress: TaskProgress }) => task.progress === progress,
    );
  }
}
