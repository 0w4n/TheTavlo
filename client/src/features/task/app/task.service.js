import { Timestamp } from "firebase/firestore";
import { TaskProgress, isTask, isNodeTask } from "../domain/task.entity";
import { TaskRules } from "../domain/task.rule";
import { err, firebaseErr, isErr, ok, unexpectedErr } from "#core/appCore/domain/AppCore.type";
export class TasksService {
    constructor(repository) {
        Object.defineProperty(this, "repository", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: repository
        });
    }
    // ─── Suscripción ─────────────────────────────────────────────────────────
    /**
     * Escucha las tareas del panel activo en tiempo real.
     * Llama a onData con la lista completa ante cualquier cambio.
     * Devuelve la función de limpieza — llamarla para cancelar la suscripción.
     */
    subscribe(onData, onError) {
        return this.repository.subscribe(onData, onError);
    }
    // ─── Queries puntuales ────────────────────────────────────────────────────
    async getAllTasks() {
        return this.repository.findAll();
    }
    async getTaskById(id) {
        return this.repository.findById(id);
    }
    // ─── Mutaciones ──────────────────────────────────────────────────────────
    async createAnyTask(data) {
        const titleError = TaskRules.validateTitle(data.title);
        if (isErr(titleError))
            return titleError;
        try {
            return ok(await this.repository.create(data));
        }
        catch {
            return err(firebaseErr("Error al crear la tarea"));
        }
    }
    async updateAnyTask(id, data) {
        if (data.title) {
            const titleError = TaskRules.validateTitle(data.title);
            if (isErr(titleError))
                return titleError;
        }
        if (data.endAt) {
            const dateError = TaskRules.validateDueDate(data.endAt.toDate());
            if (isErr(dateError))
                return dateError;
        }
        try {
            return ok(await this.repository.update(id, data));
        }
        catch {
            return err(firebaseErr("Error al actualizar la tarea"));
        }
    }
    async completeTask(id) {
        const existingTask = await this.repository.findById(id);
        if (!existingTask)
            return err(firebaseErr("Tarea no encontrada"));
        if (!isNodeTask(existingTask) || !isTask(existingTask))
            return err(firebaseErr("No se trata de una tarea"));
        if (!TaskRules.canComplete(existingTask))
            return err(firebaseErr("La tarea ya está completada"));
        if (isTask(existingTask)) {
            const res = await this.updateAnyTask(id, {
                progress: TaskProgress.SUBMITTED,
                updatedAt: Timestamp.now(),
            });
            if (isErr(res))
                return res;
            return err(unexpectedErr("Error inesperado: el resultado de la actualización no es válido"));
        }
        return err(unexpectedErr(`El id ${id} de la tarea devuelve una interfaz no válida`));
    }
    async deleteTask(id) {
        try {
            await this.repository.delete(id);
            return ok(true);
        }
        catch {
            return err(firebaseErr(`Error al eliminar la tarea con id: ${id}`));
        }
    }
    async getOverdueTasks() {
        const tasks = await this.repository.findAll();
        return tasks.filter((t) => isTask(t) && TaskRules.isOverdue(t));
    }
    async getTasksByProgress(progress) {
        const tasks = await this.repository.findAll();
        return tasks.filter((t) => isTask(t) && t.progress === progress);
    }
}
