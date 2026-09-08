import { Timestamp } from "firebase/firestore";
import { trpcMutation, trpcQuery } from "#core/appCore/infraestructure/api/trpcClient";
import type { GlobalContextValue } from "#core/globalContext/context/globalContex.type";
import { resolvePanelOwner } from "#core/globalContext/resolvePanelOwner";
import type { NoteRepository } from "../app/noteRepository.interface";
import type { CreateNoteDTO, Note, UpdateNoteDTO } from "../domain/note.entity";

function scope(ctx: GlobalContextValue) {
  if (ctx.state.status !== "ready") throw new Error("GlobalContext aún no está listo");
  const owner = resolvePanelOwner(ctx);
  return { ownerId: owner.ownerId, ownerAccountType: owner.accountType, panelId: ctx.state.state.panel.panelId };
}

function toNote(raw: unknown): Note {
  const value = raw as Note & { createdAt: string; updatedAt: string };
  return {
    ...value,
    createdAt: Timestamp.fromDate(new Date(value.createdAt)),
    updatedAt: Timestamp.fromDate(new Date(value.updatedAt)),
  };
}

function encode(data: CreateNoteDTO | UpdateNoteDTO) {
  const value = data as Record<string, any>;
  return {
    ...value,
    ...(value.createdAt ? { createdAt: value.createdAt.toDate().toISOString() } : {}),
    ...(value.updatedAt ? { updatedAt: value.updatedAt.toDate().toISOString() } : {}),
  };
}

export class TrpcNoteRepository implements NoteRepository {
  constructor(private getContext: () => GlobalContextValue) {}

  async findAll(): Promise<Note[]> {
    const notes = await trpcQuery<unknown[]>("notes.all", scope(this.getContext()));
    return notes.map(toNote);
  }

  async findById(id: string): Promise<Note | null> {
    const note = await trpcQuery<unknown | null>("notes.byId", { ...scope(this.getContext()), id });
    return note ? toNote(note) : null;
  }

  async create(data: CreateNoteDTO): Promise<Note> {
    const note = await trpcMutation<unknown>("notes.create", { ...scope(this.getContext()), data: encode(data) });
    return toNote(note);
  }

  async update(id: string, data: UpdateNoteDTO): Promise<Note> {
    const note = await trpcMutation<unknown>("notes.update", { ...scope(this.getContext()), id, data: encode(data) });
    return toNote(note);
  }

  async delete(id: string): Promise<void> {
    await trpcMutation("notes.remove", { ...scope(this.getContext()), id });
  }
}
