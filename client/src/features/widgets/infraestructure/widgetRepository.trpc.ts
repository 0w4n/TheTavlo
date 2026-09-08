import { Timestamp, type Unsubscribe } from "firebase/firestore";
import type { ResponsiveLayouts } from "react-grid-layout";
import { trpcMutation, trpcQuery } from "#core/appCore/infraestructure/api/trpcClient";
import { resolvePanelOwner } from "#core/globalContext/resolvePanelOwner";
import type { WidgetRepository } from "../app/widgetRepository.interface";
import type { CreateWidgetDTO, UpdateWidgetDTO, Widget } from "../domain/widget.entity";

const POLL_INTERVAL_MS = 30_000;

type GlobalContextValue = Parameters<typeof resolvePanelOwner>[0];

function scope(ctx: GlobalContextValue) {
  if (ctx.state.status !== "ready") throw new Error("GlobalContext aún no está listo");
  const owner = resolvePanelOwner(ctx);
  return {
    ownerId: owner.ownerId,
    ownerAccountType: owner.accountType,
    panelId: ctx.state.state.panel.panelId,
  };
}

function toWidget(raw: unknown): Widget {
  const value = raw as Widget & { createdAt: string; updatedAt: string };
  return {
    ...value,
    createdAt: Timestamp.fromDate(new Date(value.createdAt)),
    updatedAt: Timestamp.fromDate(new Date(value.updatedAt)),
  };
}

function encode(data: CreateWidgetDTO | UpdateWidgetDTO) {
  const payload: Record<string, any> = {};
  Object.assign(payload, data);
  if (payload.createdAt) payload.createdAt = payload.createdAt.toDate().toISOString();
  if (payload.updatedAt) payload.updatedAt = payload.updatedAt.toDate().toISOString();
  return payload;
}

export class TrpcWidgetRepository implements WidgetRepository {
  constructor(private getContext: () => GlobalContextValue) {}

  private async all(): Promise<Widget[]> {
    const widgets = await trpcQuery<unknown[]>("widgets.all", scope(this.getContext()));
    return widgets.map(toWidget);
  }

  subscribe(onData: (widgets: Widget[]) => void, onError: (error: string) => void): Unsubscribe {
    let stopped = false;
    const refresh = async () => {
      try {
        const widgets = await this.all();
        if (!stopped) onData(widgets);
      } catch (error) {
        if (!stopped) onError(error instanceof Error ? error.message : "Error al consultar widgets");
      }
    };
    void refresh();
    const timer = window.setInterval(refresh, POLL_INTERVAL_MS);
    return () => {
      stopped = true;
      window.clearInterval(timer);
    };
  }

  findByPanel(_panelId: string): Promise<Widget[]> { return this.all(); }

  async findById(id: string, _panelId: string): Promise<Widget | null> {
    const widget = await trpcQuery<unknown | null>("widgets.byId", { ...scope(this.getContext()), id });
    return widget ? toWidget(widget) : null;
  }

  async create(data: CreateWidgetDTO): Promise<Widget> {
    return toWidget(await trpcMutation("widgets.create", { ...scope(this.getContext()), data: encode(data) }));
  }

  async update(id: string, data: UpdateWidgetDTO): Promise<Widget> {
    return toWidget(await trpcMutation("widgets.update", { ...scope(this.getContext()), id, data: encode(data) }));
  }

  async updateLayout(layout: ResponsiveLayouts): Promise<Widget> {
    await this.updateBulkLayout(layout);
    const first = Object.values(layout)[0]?.[0];
    if (!first) throw new Error("No hay items de layout");
    const widget = await this.findById(first.i, scope(this.getContext()).panelId);
    if (!widget) throw new Error("Widget no encontrado después de actualizar layout");
    return widget;
  }

  async updateBulkLayout(layout: ResponsiveLayouts): Promise<void> {
    const updates = new Map<string, Record<string, unknown>>();
    for (const [breakpoint, items] of Object.entries(layout)) {
      for (const item of items ?? []) {
        const { i, ...value } = item;
        updates.set(i, { ...(updates.get(i) ?? {}), [breakpoint]: value });
      }
    }
    await Promise.all([...updates].map(([id, data]) => this.update(id, { layout: data } as UpdateWidgetDTO)));
  }

  async delete(id: string): Promise<void> {
    await trpcMutation("widgets.remove", { ...scope(this.getContext()), id });
  }
}
