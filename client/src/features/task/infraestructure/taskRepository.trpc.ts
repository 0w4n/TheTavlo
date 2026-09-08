import { Timestamp, type DocumentReference, type Unsubscribe } from "firebase/firestore";
import { trpcMutation, trpcQuery } from "#core/appCore/infraestructure/api/trpcClient";
import type { GlobalContextValue } from "#core/globalContext/context/globalContex.type";
import { resolvePanelOwner } from "#core/globalContext/resolvePanelOwner";
import { firebaseErr, type AppErr } from "#core/appCore/domain/AppCore.type";
import type { TaskRepository } from "../app/taskRepository.interface";
import type { AnyTask, CreateAnyTaskDTO, UpdateAnyTaskDTO } from "../domain/task.entity";

const POLL_INTERVAL_MS = 30_000;

function scope(ctx: GlobalContextValue) {
  if (ctx.state.status !== "ready") throw new Error("GlobalContext aún no está listo");
  const owner = resolvePanelOwner(ctx);
  return { ownerId: owner.ownerId, ownerAccountType: owner.accountType, panelId: ctx.state.state.panel.panelId };
}

function reference(path: string): DocumentReference {
  return { id: path.split("/").pop() ?? path, path } as DocumentReference;
}

function hydrate(value: unknown, key?: string): unknown {
  if (typeof value === "string" && ["openAt", "endAt", "createdAt", "updatedAt"].includes(key ?? "")) return Timestamp.fromDate(new Date(value));
  if (Array.isArray(value)) return value.map((item) => hydrate(item));
  if (value && typeof value === "object") {
    if (key === "subTaskId") return new Map(Object.entries(value).map(([index, path]) => [Number(index), reference(String(path))]));
    return Object.fromEntries(Object.entries(value).map(([name, nested]) => [name, hydrate(nested, name)]));
  }
  return value;
}

function encode(value: unknown): unknown {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (value instanceof Map) return Object.fromEntries([...value].map(([key, nested]) => [key, encode(nested)]));
  if (value && typeof value === "object" && "path" in value && typeof value.path === "string") return value.path;
  if (Array.isArray(value)) return value.map(encode);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, encode(nested)]));
  return value;
}

function appError(error: unknown): AppErr {
  return firebaseErr(error instanceof Error ? error.message : "Error al consultar tareas");
}

export class TrpcTaskRepository implements TaskRepository {
  constructor(private getContext: () => GlobalContextValue) {}

  private async all(): Promise<AnyTask[]> {
    const tasks = await trpcQuery<unknown[]>("tasks.all", scope(this.getContext()));
    return tasks.map((task) => hydrate(task) as AnyTask);
  }

  subscribe(onData: (tasks: AnyTask[]) => void, onError: (error: AppErr) => void): Unsubscribe {
    let stopped = false;
    const refresh = async () => {
      try { const tasks = await this.all(); if (!stopped) onData(tasks); }
      catch (error) { if (!stopped) onError(appError(error)); }
    };
    void refresh();
    const timer = window.setInterval(refresh, POLL_INTERVAL_MS);
    return () => { stopped = true; window.clearInterval(timer); };
  }

  findAll(): Promise<AnyTask[]> { return this.all(); }

  async findById(id: string): Promise<AnyTask | null> {
    const task = await trpcQuery<unknown | null>("tasks.byId", { ...scope(this.getContext()), id });
    return task ? hydrate(task) as AnyTask : null;
  }

  async create(data: CreateAnyTaskDTO): Promise<AnyTask> {
    const task = await trpcMutation<unknown>("tasks.create", { ...scope(this.getContext()), data: encode(data) });
    return hydrate(task) as AnyTask;
  }

  async update(id: string, data: UpdateAnyTaskDTO): Promise<AnyTask> {
    const task = await trpcMutation<unknown>("tasks.update", { ...scope(this.getContext()), id, data: encode(data) });
    return hydrate(task) as AnyTask;
  }

  async delete(id: string): Promise<void> {
    await trpcMutation("tasks.remove", { ...scope(this.getContext()), id });
  }
}
