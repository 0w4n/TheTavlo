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

    console.log(
      `Widget Coll Path: ${accountType}/${userId}/panels/${panelId}/widgets, panelId: ${panelId}, userId: ${userId}`,
    );

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
    const data: any = { ...widget };

    if (data.createdAt instanceof Timestamp) {
      data.createdAt = Timestamp.fromDate(data.createdAt);
    }

    if (data.updatedAt instanceof Timestamp) {
      data.updatedAt = Timestamp.fromDate(data.updatedAt);
      console.log("Cmabio")
    }

    delete data.id;
    delete data.layout.i;

    return data as DocumentData;
  }

  // -------------------------------------------------------
  // 📌 FIND
  // -------------------------------------------------------

  async findByPanel(): Promise<Widget[]> {
    const path = this.getCollectionPath();

    const q = query(collection(this.firestore, path));

    const snap = await getDocs(q);
    console.log(
      "Widgets found:",
      snap.docs.map((docSnap) =>
        this.mapDocumentToWidget(docSnap.id, docSnap.data()),
      ),
    );

    return snap.docs.map((docSnap) =>
      this.mapDocumentToWidget(docSnap.id, docSnap.data()),
    );
  }

  async findById(id: string): Promise<Widget | null> {
    const path = this.getCollectionPath();

    const ref = doc(this.firestore, path, id);
    const snap = await getDoc(ref);

    if (!snap.exists()) return null;

    return this.mapDocumentToWidget(snap.id, snap.data());
  }

  async findByRef(DocumentRef: DocumentReference): Promise<Widget | null> {
    const snap = await getDoc(DocumentRef);

    if (!snap.exists()) throw new Error("Widget no encontrado");

    return this.mapDocumentToWidget(snap.id, snap.data());
  }

  // *C* = Crear
  async create(data: CreateWidgetDTO): Promise<Widget> {
    const path = this.getCollectionPath();
    console.log(data, path);

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

  async updateLayout(layout: ResponsiveLayouts): Promise<Widget> {
    const { panelId } = this.getContext().state.panel;
    await this.updateBulkLayouts({ layout, panelId });

    if (layout["lg"] == undefined) {
      throw new Error("Widget no encontrado");
    }

    const layoutId = layout["lg"][0].i;

    const widget = await this.findById(layoutId);

    if (!widget) {
      throw new Error("Widget no encontrado después de actualizar layout");
    }

    return widget;
  }

  async updateBulkLayouts(updates: {
    layout: ResponsiveLayouts;
    panelId: string;
  }): Promise<void> {
    const batch = writeBatch(this.firestore);
    console.log(
      "Batch updating layouts for widgets:",
      updates,
      "in batch:",
      batch,
    );
    const path = this.getCollectionPath();

    // updates.forEach(({ breakPoint }: { breakPoint: Breakpoint }) => {
    //   breakPoint.forEach(({layout}: { layout: LayoutItem }) => {
    //     const id = layout.i;

    //   const ref = doc(this.firestore, path, id);
    //   batch.update(ref, {
    //     layout: layout,
    //     updatedAt: Timestamp.now(),
    //   });

    // }));

    await batch.commit();
  }

  // -------------------------------------------------------
  // 🗑️ DELETE
  // -------------------------------------------------------

  async delete(id: string): Promise<void> {
    const path = this.getCollectionPath();
    console.log(path);

    const existing = await this.findById(id);
    if (!existing) {
      throw new Error("Widget no encontrado");
    }

    const ref = doc(this.firestore, path, id);
    await deleteDoc(ref);
  }
}
