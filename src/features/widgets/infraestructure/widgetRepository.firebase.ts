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
} from "firebase/firestore";

import type { WidgetRepository } from "../app/widgetRepository.interface";
import type {
  Widget,
  CreateWidgetDTO,
  UpdateWidgetDTO,
} from "../domain/widget.entity";

import type { GlobalContextValue } from "#core/globalContext/context/globalContext";
import type { ResponsiveLayouts } from "react-grid-layout";

export class FirebaseWidgetRepository implements WidgetRepository {
  constructor(
    private firestore: Firestore,
    private getCurrentContext: () => GlobalContextValue,
  ) {}

  // -------------------------------------------------------
  // 🔐 USER HELPERS
  // -------------------------------------------------------

  private getCollectionPath(): string {
    const {
      user: { userId, accountType },
      panel: { panelId },
    } = this.getContext().state;

    return `${accountType}/${userId}/panels/${panelId}/widgets`;
  }

  private getContext(): GlobalContextValue {
    const ctx = this.getCurrentContext();
    if (!ctx) {
      throw new Error("GlobalContext no disponible");
    }
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
      isHome: data.isHome ?? false,
      layout: data.layout,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }

  private mapWidgetToDocument(
    widget: Partial<Widget> | Partial<CreateWidgetDTO>,
  ): DocumentData {
    // Spread a copy so we don't mutate the original
    const data: Record<string, any> = { ...widget };

    // Timestamps are already Timestamp instances — no conversion needed
    delete data.id;

    return data as DocumentData;
  }

  // -------------------------------------------------------
  // 📌 FIND
  // -------------------------------------------------------

  // panelId is resolved from context; the parameter keeps the interface contract
  async findByPanel(_panelId: string): Promise<Widget[]> {
    const path = this.getCollectionPath();
    const q = query(collection(this.firestore, path));
    const snap = await getDocs(q);

    return snap.docs.map((docSnap) =>
      this.mapDocumentToWidget(docSnap.id, docSnap.data()),
    );
  }

  // panelId is resolved from context; the parameter keeps the interface contract
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

    const ref = await addDoc(collection(this.firestore, path), {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    const snap = await getDoc(ref);
    if (!snap.exists()) {
      throw new Error("No se pudo crear el widget");
    }

    return this.mapDocumentToWidget(snap.id, snap.data());
  }

  // -------------------------------------------------------
  // 🔧 UPDATE
  // -------------------------------------------------------

  async update(id: string, data: UpdateWidgetDTO): Promise<Widget> {
    const path = this.getCollectionPath();

    const rawUpdate = {
      ...data,
      updatedAt: Timestamp.now(),
    };

    const updateData = this.mapWidgetToDocument(rawUpdate);

    const ref = doc(this.firestore, path, id);
    await updateDoc(ref, updateData);

    const snap = await getDoc(ref);
    if (!snap.exists()) {
      throw new Error("Error al leer el widget actualizado");
    }

    return this.mapDocumentToWidget(snap.id, snap.data());
  }

  // -------------------------------------------------------
  // 📐 LAYOUTS
  // -------------------------------------------------------

  async updateLayout(layouts: ResponsiveLayouts): Promise<Widget> {
    await this.updateBulkLayout(layouts);

    // Resolve the widget id from the first breakpoint available
    const firstBreakpoint = Object.keys(layouts)[0];
    const items = layouts[firstBreakpoint];

    if (!items || items.length === 0) {
      throw new Error("No hay items de layout para actualizar");
    }

    const widgetId = items[0].i;
    const widget = await this.findById(widgetId);

    if (!widget) {
      throw new Error("Widget no encontrado después de actualizar layout");
    }

    return widget;
  }

  async updateBulkLayout(layouts: ResponsiveLayouts): Promise<void> {
    const batch = writeBatch(this.firestore);
    const path = this.getCollectionPath();

    // Group layout items by widget id across all breakpoints
    const widgetLayouts = new Map<string, Record<string, any>>();

    for (const [breakpoint, items] of Object.entries(layouts)) {
      for (const item of items ?? []) {
        const { i: id, ...rest } = item;
        const existing = widgetLayouts.get(id) ?? {};
        existing[breakpoint] = [rest];
        widgetLayouts.set(id, existing);
      }
    }

    for (const [id, layout] of widgetLayouts.entries()) {
      const ref = doc(this.firestore, path, id);
      batch.update(ref, {
        layout,
        updatedAt: Timestamp.now(),
      });
    }

    await batch.commit();
  }

  // -------------------------------------------------------
  // 🗑️ DELETE
  // -------------------------------------------------------

  async delete(id: string): Promise<void> {
    const path = this.getCollectionPath();

    const existing = await this.findById(id);
    if (!existing) {
      throw new Error("Widget no encontrado");
    }

    const ref = doc(this.firestore, path, id);
    await deleteDoc(ref);
  }
}
