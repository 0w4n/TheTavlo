import type { Unsubscribe } from "firebase/firestore";
import { Timestamp } from "firebase/firestore";
import {
  TaskProgress,
  type CreateAnyTaskDTO,
  type UpdateAnyTaskDTO,
  type AnyTask,
  isTask,
  isNodeTask
} from "../domain/task.entity";
import { TaskRules } from "../domain/task.rule";
import type { TaskRepository } from "./taskRepository.interface";
import { firebaseErr, unexpectedErr, type AppErr, type ResultApp } from "#core/appCore/domain/AppCore.type";

export class TasksService {
  constructor(private repository: TaskRepository) {}

  // ─── Suscripción ─────────────────────────────────────────────────────────

  /**
   * Escucha las tareas del panel activo en tiempo real.
   * Llama a onData con la lista completa ante cualquier cambio.
   * Devuelve la función de limpieza — llamarla para cancelar la suscripción.
   */
  subscribe(
    onData: (tasks: AnyTask[]) => void,
    onError: (err: AppErr) => void,
  ): Unsubscribe {
    return this.repository.subscribe(onData, onError);
  }

  // ─── Queries puntuales ────────────────────────────────────────────────────

  async getAllTasks(): Promise<AnyTask[]> {
    return this.repository.findAll();
  }

  async getTaskById(id: string): Promise<AnyTask | null> {
    return this.repository.findById(id);
  }

  // ─── Mutaciones ──────────────────────────────────────────────────────────

  async createAnyTask(data: CreateAnyTaskDTO): Promise<ResultApp<AnyTask, AppErr>> {
    const titleError = TaskRules.validateTitle(data.title);
    if (titleError) return unexpectedErr(titleError);

    try {
      return await this.repository.create(data);
    } catch {
      return firebaseErr("Error al crear la tarea");
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
      return await this.repository.update(id, data);
    } catch {
      return Error("Error al actualizar la tarea");
    }
  }

  async completeTask(id: string): Promise<AnyTask | Error> {
    const existingTask = await this.repository.findById(id);
    if (!existingTask) return Error("Tarea no encontrada");
    if (!isNodeTask(existingTask) || !isTask(existingTask))
      return Error("No se trata de una tarea");
    if (!TaskRules.canComplete(existingTask))
      return Error("La tarea ya está completada");

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
    }

    return Error(`El id ${id} de la tarea devuelve una interfaz no válida`);
  }

  async deleteTask(id: string): Promise<boolean | Error> {
    try {
      await this.repository.delete(id);
      return true;
    } catch {
      return Error(`Error al eliminar la tarea con id: ${id}`);
    }
  }

  async getOverdueTasks(): Promise<AnyTask[]> {
    const tasks = await this.repository.findAll();
    return tasks.filter((t) => isTask(t) && TaskRules.isOverdue(t));
  }

  async getTasksByProgress(progress: TaskProgress): Promise<AnyTask[]> {
    const tasks = await this.repository.findAll();
    return tasks.filter((t) => isTask(t) && t.progress === progress);
  }
}
