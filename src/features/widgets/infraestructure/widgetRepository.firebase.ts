import {
  Firestore,
  type DocumentData,
  Timestamp,
  query,
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  getDoc,
  writeBatch,
  deleteDoc,
  DocumentReference,
  onSnapshot,
  type Unsubscribe,
} from "firebase/firestore";
import type { WidgetRepository } from "../app/widgetRepository.interface";
import type {
  Widget,
  CreateWidgetDTO,
  UpdateWidgetDTO,
  LayoutItemDTO,
} from "../domain/widget.entity";

import type { GlobalContextValue } from "#core/globalContext/context/globalContext";
import type { ResponsiveLayouts } from "react-grid-layout";

export class FirebaseWidgetRepository implements WidgetRepository {
  constructor(
    private firestore: Firestore,
    private getCurrentContext: () => GlobalContextValue,
  ) {}

  // -------------------------------------------------------
  // 🔐 HELPERS
  // -------------------------------------------------------

  private getCollectionPath(): string {
    // Igual que en events/task: usamos el propietario REAL del panel
    // (state.panel.ownerId/ownerAccountType), no el usuario que está
    // mirando. Si no, un invitado que entra por un enlace de invitación
    // nunca encuentra los widgets del panel ajeno.
    const {
      user: { userId, accountType },
      panel: { panelId, ownerId },
    } = this.getContext().state;

    if (ownerId !== null) {
      return `${accountType}/${ownerId}/panels/${panelId}/widgets`;
    } else {
      return `${accountType}/${userId}/panels/${panelId}/widgets`;
    }

  }

  private getContext(): GlobalContextValue {
    const ctx = this.getCurrentContext();
    if (!ctx) throw new Error("GlobalContext no disponible");
    return ctx;
  }

  // -------------------------------------------------------
  // 🔄 MAPPERS
  // -------------------------------------------------------

  private mapDocumentToWidget(id: string, data: DocumentData): Widget {
    return {
      id,
      type: data.type,
      config: data.config ?? {},
      locked: data.locked ?? false,
      layout: data.layout,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }

  private mapWidgetToDocument(
    widget: Partial<Widget> | Partial<CreateWidgetDTO>,
  ): DocumentData {
    const data: Record<string, any> = { ...widget };
    delete data.id;
    return data as DocumentData;
  }

  // -------------------------------------------------------
  // 📡 SUSCRIPCIÓN EN TIEMPO REAL
  // -------------------------------------------------------

  /**
   * Escucha los widgets del panel activo en tiempo real.
   * La primera emisión carga los datos actuales; las siguientes
   * reflejan cualquier cambio en Firestore sin polling.
   */
  subscribe(
    onData: (widgets: Widget[]) => void,
    onError: (err: string) => void,
  ): Unsubscribe {
    const path = this.getCollectionPath();
    const q = query(collection(this.firestore, path));

    return onSnapshot(
      q,
      (snap) => {
        const widgets = snap.docs.map((d) =>
          this.mapDocumentToWidget(d.id, d.data()),
        );
        onData(widgets);
      },
      (error) => onError(error.message),
    );
  }

  // -------------------------------------------------------
  // 📌 QUERIES PUNTUALES
  // -------------------------------------------------------

  async findByPanel(_panelId: string): Promise<Widget[]> {
    const path = this.getCollectionPath();
    const q = query(collection(this.firestore, path));
    const snap = await getDocs(q);
    return snap.docs.map((d) => this.mapDocumentToWidget(d.id, d.data()));
  }

  async findById(id: string, _panelId?: string): Promise<Widget | null> {
    const path = this.getCollectionPath();
    const ref = doc(this.firestore, path, id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return this.mapDocumentToWidget(snap.id, snap.data());
  }

  async findByRef(documentRef: DocumentReference): Promise<Widget | null> {
    const snap = await getDoc(documentRef);
    if (!snap.exists()) throw new Error("Widget no encontrado");
    return this.mapDocumentToWidget(snap.id, snap.data());
  }

  // -------------------------------------------------------
  // ➕ CREATE
  // -------------------------------------------------------

  async create(data: CreateWidgetDTO): Promise<Widget> {
    const path = this.getCollectionPath();
    const now = Timestamp.now();

    const payload = {
      ...data,
      createdAt: now,
      updatedAt: now,
    };

    const ref = await addDoc(collection(this.firestore, path), payload);

    // Construimos el objeto local para no hacer un getDoc extra
    return this.mapDocumentToWidget(ref.id, payload);
  }

  // -------------------------------------------------------
  // 🔧 UPDATE
  // -------------------------------------------------------

  async update(id: string, data: UpdateWidgetDTO): Promise<Widget> {
    const path = this.getCollectionPath();
    const now = Timestamp.now();

    const rawUpdate = { ...data, updatedAt: now };
    const updateData = this.mapWidgetToDocument(rawUpdate);

    const ref = doc(this.firestore, path, id);
    await updateDoc(ref, updateData);

    // Construimos el objeto local sin round-trip extra
    const existing = await this.findById(id);
    if (!existing) throw new Error("Widget no encontrado tras actualizar");
    return { ...existing, ...data, updatedAt: now };
  }

  // -------------------------------------------------------
  // 📐 LAYOUTS
  // -------------------------------------------------------

  async updateLayout(layouts: ResponsiveLayouts): Promise<Widget> {
    await this.updateBulkLayout(layouts);

    const firstBreakpoint = Object.keys(layouts)[0];
    const items = layouts[firstBreakpoint];
    if (!items?.length) throw new Error("No hay items de layout");

    const widget = await this.findById(items[0].i);
    if (!widget)
      throw new Error("Widget no encontrado después de actualizar layout");
    return widget;
  }

  async updateBulkLayout(layouts: ResponsiveLayouts): Promise<void> {
    const batch = writeBatch(this.firestore);
    const path = this.getCollectionPath();
    const now = Timestamp.now();

    const widgetLayouts = new Map<string, Record<string, LayoutItemDTO>>();

    for (const [breakpoint, items] of Object.entries(layouts)) {
      for (const item of items ?? []) {
        const { i: id, ...rest } = item;
        const existing = widgetLayouts.get(id) ?? {};
        existing[breakpoint] = { x: rest.x, y: rest.y, w: rest.w, h: rest.h };
        widgetLayouts.set(id, existing);
      }
    }

    for (const [id, layout] of widgetLayouts.entries()) {
      const ref = doc(this.firestore, path, id);
      batch.update(ref, { layout, updatedAt: now });
    }

    await batch.commit();
  }

  // -------------------------------------------------------
  // 🗑️ DELETE
  // -------------------------------------------------------

  async delete(id: string): Promise<void> {
    const path = this.getCollectionPath();
    const ref = doc(this.firestore, path, id);
    await deleteDoc(ref);
  }
}
