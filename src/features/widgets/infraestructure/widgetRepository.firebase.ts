import {
  Firestore,
  type DocumentData,
  Timestamp,
  query,
  collection,
  where,
  orderBy,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  getDoc,
  writeBatch,
  deleteDoc,
} from "firebase/firestore";

import type { WidgetRepository } from "../app/widgetRepository.interface";
import type {
  Widget,
  CreateWidgetDTO,
  UpdateWidgetDTO,
  WidgetLayout,
} from "../domain/widget.entity";

import type { GlobalContextValue } from "#core/globalContext/globalContext";

export class FirebaseWidgetRepository implements WidgetRepository {
  constructor(
    private firestore: Firestore,
    private getCurrentContext: () => GlobalContextValue
  ) {}

  // -------------------------------------------------------
  // 🔐 USER HELPERS
  // -------------------------------------------------------

  private getCollectionPath(panelId: string): string {
    const { userId, accountType } = this.getContext().state.user;
    const basePath = accountType === "guests" ? "guests" : "users";
    return `${basePath}/${userId}/panels/${panelId}/widgets`;
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
    const createdAtField = data.createdAt;
    const updatedAtField = data.updatedAt;

    return {
      id,
      type: data.type,
      title: data.title,
      config: data.config ?? {},
      locked: data.locked ?? false,
      isHome: data.isHome ?? false,
      layout: data.layout,
      createdAt:
        createdAtField instanceof Timestamp
          ? createdAtField.toDate()
          : createdAtField,
      updatedAt:
        updatedAtField instanceof Timestamp
          ? updatedAtField.toDate()
          : updatedAtField,
    };
  }

  private mapWidgetToDocument(
    widget: Partial<Widget> | Partial<CreateWidgetDTO>
  ): DocumentData {
    const data: any = { ...widget };

    if (data.createdAt instanceof Timestamp) {
      data.createdAt = Timestamp.fromDate(data.createdAt);
    }
    if (data.updatedAt instanceof Timestamp) {
      data.updatedAt = Timestamp.fromDate(data.updatedAt);
    }

    delete data.id;

    return data as DocumentData;
  }

  // -------------------------------------------------------
  // 📌 FIND
  // -------------------------------------------------------

  async findByPanel(panelId: string): Promise<Widget[]> {
    const path = this.getCollectionPath(panelId);

    const q = query(
      collection(this.firestore, path),
      where("visible", "==", true),
      orderBy("layout.y", "asc"),
      orderBy("layout.x", "asc")
    );

    const snap = await getDocs(q);
    return snap.docs.map((docSnap) =>
      this.mapDocumentToWidget(docSnap.id, docSnap.data())
    );
  }

  async findById(id: string, panelId: string): Promise<Widget | null> {
    const path = this.getCollectionPath(panelId);

    const ref = doc(this.firestore, path, id);
    const snap = await getDoc(ref);

    if (!snap.exists()) return null;

    return this.mapDocumentToWidget(snap.id, snap.data());
  }

  // *C* = Crear
  async create(data: CreateWidgetDTO): Promise<Widget> {
    const { panelId } = this.getCurrentContext().state.panel;

    const path = this.getCollectionPath(panelId);
    console.log(data, path, panelId);

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
    const { panelId } = this.getCurrentContext().state.panel;

    const path = this.getCollectionPath(panelId);

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

  async updateLayout(id: string, layout: WidgetLayout): Promise<Widget> {
    const { panelId } = this.getCurrentContext().state.panel;

    await this.updateBulkLayouts([{ id, layout, panelId }]);

    const widget = await this.findById(id, panelId);
    if (!widget) {
      throw new Error("Widget no encontrado después de actualizar layout");
    }
    return widget;
  }

  async updateBulkLayouts(
    updates: Array<{ id: string; layout: WidgetLayout; panelId: string }>
  ): Promise<void> {
    if (updates.length === 0) return;

    const batch = writeBatch(this.firestore);

    updates.forEach(({ id, layout, panelId }) => {
      const path = this.getCollectionPath(panelId);
      const ref = doc(this.firestore, path, id);
      batch.update(ref, {
        layout,
        updatedAt: Timestamp.fromDate(new Date()),
      });
    });

    await batch.commit();
  }

  // -------------------------------------------------------
  // 🗑️ DELETE
  // -------------------------------------------------------

  async delete(id: string): Promise<void> {
    const { panelId } = this.getCurrentContext().state.panel;

    const path = this.getCollectionPath(panelId);
    console.log(path);

    const existing = await this.findById(id, panelId);
    if (!existing) {
      throw new Error("Widget no encontrado");
    }

    const ref = doc(this.firestore, path, id);
    await deleteDoc(ref);
  }
}
