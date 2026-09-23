import { Timestamp, type Unsubscribe } from "firebase/firestore";
import {
  trpcMutation,
  trpcQuery,
} from "#core/appCore/infraestructure/api/trpcClient";
import { firebaseErr, type AppErr } from "#core/appCore/domain/AppCore.type";
import type { GlobalContextValue } from "#core/globalContext/context/globalContex.type";
import { resolvePanelOwner } from "#core/globalContext/resolvePanelOwner";
import type { DirtyNoteRepository } from "../app/DirtyNoteRepository.interface";
import type {
  CreateDirtyNoteDTO,
  DirtyNote,
  DirtyNoteChanges,
  UpdateDirtyNoteDTO,
} from "../domain/DirtyNote.entity";
import { DirtyNoteRules } from "../domain/DirtyNote.rules";

// Sin onSnapshot vía backend: se refresca por polling, igual que el resto de
// repositorios tRPC del proyecto (ver taskRepository.trpc.ts).
const POLL_INTERVAL_MS = 30_000;

type RawDirtyNote = {
  id: string;
  title?: unknown;
  content?: unknown;
  status?: unknown;
  createdAt?: string;
  updatedAt?: string;
};

function scope(ctx: GlobalContextValue) {
  if (ctx.state.status !== "ready") {
    throw new Error("GlobalContext aún no está listo");
  }
  const owner = resolvePanelOwner(ctx);
  return {
    ownerId: owner.ownerId,
    ownerAccountType: owner.accountType,
    panelId: ctx.state.state.panel.panelId,
  };
}

function toTimestamp(iso: string | undefined): Timestamp {
  const date = iso ? new Date(iso) : new Date(0);
  return Timestamp.fromDate(Number.isNaN(date.getTime()) ? new Date(0) : date);
}

function toDirtyNote(raw: unknown): DirtyNote {
  const value = raw as RawDirtyNote;
  return {
    id: value.id,
    title: typeof value.title === "string" ? value.title : "",
    content: typeof value.content === "string" ? value.content : "",
    status: DirtyNoteRules.toStatus(value.status),
    createdAt: toTimestamp(value.createdAt),
    updatedAt: toTimestamp(value.updatedAt),
  };
}

function toChanges(raw: unknown): DirtyNoteChanges {
  const full = toDirtyNote(raw);
  return {
    id: full.id,
    title: full.title,
    content: full.content,
    status: full.status,
    updatedAt: full.updatedAt,
  };
}

function toAppErr(error: unknown): AppErr {
  return firebaseErr(
    error instanceof Error ? error.message : "Error al consultar las DirtyNote",
    undefined,
    error instanceof Error ? error.stack : undefined,
  );
}

export class TrpcDirtyNoteRepository implements DirtyNoteRepository {
  constructor(private readonly getContext: () => GlobalContextValue) {}

  subscribe(
    onData: (dirtyNotes: DirtyNote[]) => void,
    onError: (err: AppErr) => void,
  ): Unsubscribe {
    let stopped = false;
    const refresh = async () => {
      try {
        const dirtyNotes = await this.findAll();
        if (!stopped) onData(dirtyNotes);
      } catch (error) {
        if (!stopped) onError(toAppErr(error));
      }
    };
    void refresh();
    const timer = window.setInterval(refresh, POLL_INTERVAL_MS);
    return () => {
      stopped = true;
      window.clearInterval(timer);
    };
  }

  async findAll(): Promise<DirtyNote[]> {
    const list = await trpcQuery<unknown[]>(
      "dirtyNote.all",
      scope(this.getContext()),
    );
    return list.map(toDirtyNote);
  }

  async findById(id: string): Promise<DirtyNote | null> {
    const raw = await trpcQuery<unknown | null>("dirtyNote.byId", {
      ...scope(this.getContext()),
      id,
    });
    return raw ? toDirtyNote(raw) : null;
  }

  async create(data: CreateDirtyNoteDTO): Promise<DirtyNote> {
    const raw = await trpcMutation<unknown>("dirtyNote.create", {
      ...scope(this.getContext()),
      data,
    });
    return toDirtyNote(raw);
  }

  async update(id: string, data: UpdateDirtyNoteDTO): Promise<DirtyNoteChanges> {
    const raw = await trpcMutation<unknown>("dirtyNote.update", {
      ...scope(this.getContext()),
      id,
      data,
    });
    return toChanges(raw);
  }

  async delete(id: string): Promise<void> {
    await trpcMutation("dirtyNote.remove", { ...scope(this.getContext()), id });
  }
}
