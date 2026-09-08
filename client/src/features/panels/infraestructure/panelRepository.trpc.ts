import { Timestamp, type DocumentReference, type Unsubscribe } from "firebase/firestore";
import { trpcMutation, trpcQuery } from "#core/appCore/infraestructure/api/trpcClient";
import type { User } from "#core/auth/domain/user.entity";
import { err, firebaseErr, ok, type AppErr, type ResultApp } from "#core/appCore/domain/AppCore.type";
import type { PanelRepository } from "../app/panelsRepository.interface";
import type { CreatePanelDTO, Panel, UpdatePanelDTO } from "../domain/panel.entity";

const POLL_INTERVAL_MS = 30_000;

interface WirePanel extends Omit<Panel, "parentId" | "sharedWith" | "createdAt" | "updatedAt"> {
  parentId: string | null;
  sharedWith: string | null;
  createdAt: string;
  updatedAt: string;
}

function refToPath(ref: DocumentReference | null | undefined): string | null {
  return ref?.path ?? null;
}

function toReference(path: string | null): DocumentReference | null {
  if (!path) return null;
  const id = path.split("/").pop() ?? path;
  return { id, path } as DocumentReference;
}

function toPanel(raw: unknown): Panel {
  const value = raw as WirePanel;
  return {
    ...value,
    parentId: toReference(value.parentId),
    sharedWith: toReference(value.sharedWith),
    createdAt: Timestamp.fromDate(new Date(value.createdAt)),
    updatedAt: Timestamp.fromDate(new Date(value.updatedAt)),
  };
}

function encodePanel(data: CreatePanelDTO | UpdatePanelDTO) {
  const value = data as Record<string, any>;
  return {
    ...value,
    parentId: refToPath(value.parentId),
    sharedWith: refToPath(value.sharedWith),
    ...(value.createdAt ? { createdAt: value.createdAt.toDate().toISOString() } : {}),
    ...(value.updatedAt ? { updatedAt: value.updatedAt.toDate().toISOString() } : {}),
  };
}

function toAppError(error: unknown): AppErr {
  return firebaseErr(error instanceof Error ? error.message : "Error al consultar paneles");
}

export class TrpcPanelsRepository implements PanelRepository {
  constructor(_getCurrentUser: () => User) {}

  private async all(): Promise<Panel[]> {
    const panels = await trpcQuery<unknown[]>("panels.all", {});
    return panels.map(toPanel);
  }

  private poll(onData: (panels: Panel[]) => void, onError: (error: AppErr) => void): Unsubscribe {
    let stopped = false;
    const refresh = async () => {
      try {
        const panels = await this.all();
        if (!stopped) onData(panels);
      } catch (error) {
        if (!stopped) onError(toAppError(error));
      }
    };
    void refresh();
    const timer = window.setInterval(refresh, POLL_INTERVAL_MS);
    return () => {
      stopped = true;
      window.clearInterval(timer);
    };
  }

  subscribeToHomePanel(onData: (panel: Panel) => void, onError: (error: AppErr) => void): Unsubscribe {
    return this.poll((panels) => {
      const home = panels.find((panel) => panel.color === -1 && panel.parentId === null);
      if (home) onData(home);
    }, onError);
  }

  subscribeToAll(onData: (panels: Panel[]) => void, onError: (error: AppErr) => void): Unsubscribe {
    return this.poll(onData, onError);
  }

  async findAll(): Promise<ResultApp<Panel[], AppErr>> {
    try { return ok(await this.all()); } catch (error) { return err(toAppError(error)); }
  }

  async findHomePanel(): Promise<ResultApp<Panel, AppErr>> {
    const result = await this.findAll();
    if (!result.success) return result;
    const home = result.value.find((panel) => panel.color === -1 && panel.parentId === null);
    if (home) return ok(home);
    return this.create({ parentId: null, name: "", color: -1, icon: "", sharedWith: null, createdAt: Timestamp.now(), updatedAt: Timestamp.now() });
  }

  async findById(id: string): Promise<ResultApp<Panel | undefined, AppErr>> {
    try {
      const panel = await trpcQuery<unknown | null>("panels.byId", { id });
      return ok(panel ? toPanel(panel) : undefined);
    } catch (error) { return err(toAppError(error)); }
  }

  async findManyByIds(ids: string[]): Promise<ResultApp<Panel[], AppErr>> {
    const result = await this.findAll();
    return result.success ? ok(result.value.filter((panel) => ids.includes(panel.id))) : result;
  }

  async findByRef(ref: DocumentReference): Promise<ResultApp<Panel | undefined, AppErr>> { return this.findById(ref.id); }
  async findByOwner(ownerAccountType: string, ownerId: string, panelId: string): Promise<ResultApp<Panel | undefined, AppErr>> {
    try {
      const panel = await trpcQuery<unknown | null>("panels.byOwner", { ownerAccountType, ownerId, panelId });
      return ok(panel ? toPanel(panel) : undefined);
    } catch (error) { return err(toAppError(error)); }
  }
  async findBySharedId(sharedId: DocumentReference): Promise<ResultApp<Panel | undefined, AppErr>> {
    const result = await this.findAll();
    return result.success ? ok(result.value.find((panel) => panel.sharedWith?.id === sharedId.id)) : result;
  }
  async findByParentId(parentId: DocumentReference): Promise<ResultApp<Panel[], AppErr>> {
    const result = await this.findAll();
    return result.success ? ok(result.value.filter((panel) => panel.parentId?.id === parentId.id)) : result;
  }
  async findDocRef(id: string): Promise<ResultApp<DocumentReference, AppErr>> { return ok(toReference(id) as DocumentReference); }
  async findArchived(parentRef: DocumentReference): Promise<ResultApp<Panel[] | undefined, AppErr>> {
    const result = await this.findByParentId(parentRef);
    return result.success ? ok(result.value.filter((panel) => panel.isArchived)) : result;
  }

  async create(data: CreatePanelDTO, parentId?: DocumentReference): Promise<ResultApp<Panel, AppErr>> {
    try {
      const panel = await trpcMutation<unknown>("panels.create", encodePanel({ ...data, parentId: parentId ?? data.parentId }));
      return ok(toPanel(panel));
    } catch (error) { return err(toAppError(error)); }
  }

  async addSubPanel(_parentRef: DocumentReference): Promise<ResultApp<void, AppErr>> {
    return ok(undefined);
  }

  async archive(id: string): Promise<ResultApp<Panel, AppErr>> { return this.update(id, { isArchived: true } as UpdatePanelDTO); }
  async unarchive(id: string): Promise<ResultApp<Panel, AppErr>> { return this.update(id, { isArchived: false } as UpdatePanelDTO); }

  async update(id: string, data: UpdatePanelDTO): Promise<ResultApp<Panel, AppErr>> {
    try {
      const panel = await trpcMutation<unknown>("panels.update", { id, ...encodePanel(data) });
      return ok(toPanel(panel));
    } catch (error) { return err(toAppError(error)); }
  }

  async delete(id: string): Promise<ResultApp<void, AppErr>> {
    try { await trpcMutation("panels.remove", { id }); return ok(undefined); }
    catch (error) { return err(toAppError(error)); }
  }

  async deleteCascade(id: string): Promise<ResultApp<{ deletedIds: string[] }, AppErr>> {
    const result = await this.findAll();
    if (!result.success) return result;
    const ids = [id];
    const queue = [id];
    while (queue.length) {
      const parent = queue.shift()!;
      for (const panel of result.value.filter((candidate) => candidate.parentId?.id === parent)) {
        ids.push(panel.id);
        queue.push(panel.id);
      }
    }
    for (const panelId of ids) await this.delete(panelId);
    return ok({ deletedIds: ids });
  }

  async deleteArchived(ref: DocumentReference): Promise<ResultApp<Panel[], AppErr>> {
    const result = await this.findById(ref.id);
    if (!result.success) return result;
    if (!result.value) return ok([]);
    const deleted = await this.delete(ref.id);
    return deleted.success ? ok([result.value]) : deleted;
  }
}
