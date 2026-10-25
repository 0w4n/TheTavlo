import { vi } from "vitest";
import type { DocumentReference, Unsubscribe } from "firebase/firestore";
import type { PanelRepository } from "../../app/panelsRepository.interface";
import type {
  CreatePanelDTO,
  Panel,
  UpdatePanelDTO,
} from "../../domain/panel.entity";
import {
  err,
  notFoundErr,
  ok,
  type AppErr,
  type ResultApp,
} from "#core/appCore/domain/AppCore.type";

export function refTo(id: string): DocumentReference {
  return { id } as DocumentReference;
}

let autoId = 0;
function nextId(): string {
  autoId += 1;
  return `fake-panel-${autoId}`;
}

/**
 * Implementación 100% en memoria de `PanelRepository`, para tests que no
 * quieren (ni deberían) tocar Firestore de verdad. Expone contadores de
 * llamadas (`calls`) para que los tests de `CachedPanelsRepository` puedan
 * afirmar cosas del tipo "la segunda navegación no generó ninguna lectura
 * nueva" sin depender de mocks de red.
 */
export function createFakePanelRepository(initialPanels: Panel[] = []) {
  const panels = new Map<string, Panel>(initialPanels.map((p) => [p.id, p]));

  const calls = {
    findById: 0,
    findManyByIds: 0,
    findByParentId: 0,
    create: 0,
    update: 0,
    delete: 0,
    deleteCascade: 0,
    findArchived: 0,
    archive: 0,
    unarchive: 0,
    deleteArchived: 0,
  };

  const repository: PanelRepository = {
    subscribeToHomePanel(onData: (panel: Panel) => void): Unsubscribe {
      const home = Array.from(panels.values())[0];
      if (home) onData(home);
      return () => { };
    },

    subscribeToAll(onData: (panels: Panel[]) => void): Unsubscribe {
      onData(Array.from(panels.values()));
      return () => { };
    },

    async findAll(): Promise<ResultApp<Panel[], AppErr>> {
      return ok(Array.from(panels.values()));
    },

    async findHomePanel(): Promise<ResultApp<Panel, AppErr>> {
      const home = Array.from(panels.values())[0];
      if (!home) return err(notFoundErr("No hay panel home"));
      return ok(home);
    },

    async findById(id: string): Promise<ResultApp<Panel | undefined, AppErr>> {
      calls.findById += 1;
      return ok(panels.get(id));
    },

    async findManyByIds(ids: string[]): Promise<ResultApp<Panel[], AppErr>> {
      calls.findManyByIds += 1;
      const found = ids
        .map((id) => panels.get(id))
        .filter((p): p is Panel => p !== undefined);
      return ok(found);
    },

    async findByRef(
      ref: DocumentReference
    ): Promise<ResultApp<Panel | undefined, AppErr>> {
      return ok(panels.get(ref.id));
    },

    async findBySharedId(
      sharedId: DocumentReference
    ): Promise<ResultApp<Panel | undefined, AppErr>> {
      const found = Array.from(panels.values()).find(
        (p) => p.sharedWith?.id === sharedId.id
      );
      return ok(found);
    },

    async findByParentId(
      parentId: DocumentReference
    ): Promise<ResultApp<Panel[], AppErr>> {
      calls.findByParentId += 1;
      const children = Array.from(panels.values()).filter(
        (p) => p.parentId?.id === parentId.id
      );
      return ok(children);
    },

    async findDocRef(id: string): Promise<ResultApp<DocumentReference, AppErr>> {
      return ok(refTo(id));
    },

    async create(
      data: CreatePanelDTO,
      parentId?: DocumentReference
    ): Promise<ResultApp<Panel, AppErr>> {
      calls.create += 1;
      const id = nextId();
      const panel: Panel = {
        id,
        parentId: parentId ?? null,
        name: data.name,
        color: data.color,
        icon: data.icon,
        sharedWith: data.sharedWith ?? null,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      };
      panels.set(id, panel);
      return ok(panel);
    },

    async addSubPanel(): Promise<ResultApp<void, AppErr>> {
      return ok(undefined);
    },

    async update(
      id: string,
      data: UpdatePanelDTO
    ): Promise<ResultApp<Panel, AppErr>> {
      calls.update += 1;
      const existing = panels.get(id);
      if (!existing) return err(notFoundErr(`Panel "${id}" no encontrado`));
      const updated = { ...existing, ...data };
      panels.set(id, updated);
      return ok(updated);
    },

    async delete(id: string): Promise<ResultApp<void, AppErr>> {
      calls.delete += 1;
      panels.delete(id);
      return ok(undefined);
    },

    async deleteCascade(
      id: string
    ): Promise<ResultApp<{ deletedIds: string[]; }, AppErr>> {
      calls.deleteCascade += 1;
      const deletedIds: string[] = [];
      const queue = [id];

      while (queue.length > 0) {
        const currentId = queue.shift() as string;
        if (!panels.has(currentId)) continue;
        deletedIds.push(currentId);
        panels.delete(currentId);

        for (const p of Array.from(panels.values())) {
          if (p.parentId?.id === currentId) queue.push(p.id);
        }
      }

      return ok({ deletedIds });
    },
    
async findArchived(
      parentRef?: DocumentReference
    ): Promise<ResultApp<Panel[] | undefined, AppErr>> {
      calls.findArchived += 1;
      const archived = Array.from(panels.values()).filter(
        (p) => (p as { isArchived?: boolean }).isArchived && (!parentRef || p.parentId?.id === parentRef.id)
      );
      return ok(archived);
    },

    async archive(id: string): Promise<ResultApp<Panel, AppErr>> {
      calls.archive += 1;
      const existing = panels.get(id);
      if (!existing) return err(notFoundErr(`Panel "${id}" no encontrado`));
      
      const updated = { ...existing, isArchived: true };
      panels.set(id, updated);
      return ok(updated);
    },

    async unarchive(id: string): Promise<ResultApp<Panel, AppErr>> {
      calls.unarchive += 1;
      const existing = panels.get(id);
      if (!existing) return err(notFoundErr(`Panel "${id}" no encontrado`));

      const updated = { ...existing, isArchived: false };
      panels.set(id, updated);
      return ok(updated);
    },

    async deleteArchived(
      parentRef?: DocumentReference
    ): Promise<ResultApp<Panel[], AppErr>> {
      calls.deleteArchived += 1;
      const deleted: Panel[] = [];
      for (const [id, panel] of panels.entries()) {
        const isArchived = (panel as { isArchived?: boolean }).isArchived;
        const matchesParent = !parentRef || panel.parentId?.id === parentRef.id;
        
        if (isArchived && matchesParent) {
          deleted.push(panel);
          panels.delete(id);
        }
      }
      return ok(deleted);
    },  
};

  return {
    repository,
    calls,
    /** Acceso directo al store interno — útil para setup/aserciones en tests. */
    panels,
    spies: {
      findById: vi.spyOn(repository, "findById"),
      findManyByIds: vi.spyOn(repository, "findManyByIds"),
      findByParentId: vi.spyOn(repository, "findByParentId"),
    },
  };
}
