import { Timestamp } from "firebase/firestore";
import type { GlobalContextValue } from "#core/globalContext/context/globalContex.type";
import { resolvePanelOwner } from "#core/globalContext/resolvePanelOwner";
import { trpcMutation, trpcQuery } from "#core/appCore/infraestructure/api/trpcClient";
import type { EventRepository } from "../app/eventRepository.interface";
import type { AnyEvent, CreateAnyEventDTO, UpdateAnyEventDTO } from "../domain/events.entity";

const DATE_KEYS = new Set(["createdAt", "updatedAt", "startAt", "endAt", "makeAt", "untilDate"]);

function scope(ctx: GlobalContextValue) {
  if (ctx.state.status !== "ready") throw new Error("GlobalContext aún no está listo");
  const owner = resolvePanelOwner(ctx);
  return { ownerId: owner.ownerId, ownerAccountType: owner.accountType, panelId: ctx.state.state.panel.panelId };
}

function hydrate(value: unknown, key?: string): unknown {
  if (typeof value === "string" && key && DATE_KEYS.has(key)) return Timestamp.fromDate(new Date(value));
  if (Array.isArray(value)) return value.map((item) => hydrate(item));
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([name, nested]) => [name, hydrate(nested, name)]));
  return value;
}

function encode(value: unknown): unknown {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (Array.isArray(value)) return value.map(encode);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, encode(nested)]));
  return value;
}

export class TrpcEventRepository implements EventRepository {
  constructor(private getContext: () => GlobalContextValue) {}

  async findAll(): Promise<AnyEvent[]> {
    const events = await trpcQuery<unknown[]>("events.all", scope(this.getContext()));
    return events.map((event) => hydrate(event) as AnyEvent);
  }

  async findById(id: string): Promise<AnyEvent | undefined> {
    const event = await trpcQuery<unknown | null>("events.byId", { ...scope(this.getContext()), id });
    return event ? hydrate(event) as AnyEvent : undefined;
  }

  async create(data: CreateAnyEventDTO): Promise<AnyEvent> {
    const event = await trpcMutation<unknown>("events.create", { ...scope(this.getContext()), data: encode(data) });
    return hydrate(event) as AnyEvent;
  }

  async update(id: string, data: UpdateAnyEventDTO): Promise<AnyEvent> {
    const event = await trpcMutation<unknown>("events.update", { ...scope(this.getContext()), id, data: encode(data) });
    return hydrate(event) as AnyEvent;
  }

  async delete(id: string): Promise<void> {
    await trpcMutation("events.remove", { ...scope(this.getContext()), id });
  }
}
