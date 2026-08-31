import {
  Firestore,
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
import { resolvePanelOwner } from "#core/globalContext/resolvePanelOwner";
import { withoutId } from "#core/appCore/infraestructure/firebase/withoutId";
import type { ResponsiveLayouts } from "react-grid-layout";
import { widgetConverter } from "./widget.converter";

export class FirebaseWidgetRepository implements WidgetRepository {
  constructor(
    private firestore: Firestore,
    private getCurrentContext: () => GlobalContextValue,
  ) {}

  // -------------------------------------------------------
  // 🔐 HELPERS
  // -------------------------------------------------------

  private getCollectionPath(): string {
    // Usamos el propietario REAL del panel (resolvePanelOwner: ownerId +
    // ownerAccountType del dueño, no del usuario que está mirando).
    const ctx = this.getContext();
    const { accountType, ownerId } = resolvePanelOwner(ctx);
    const { panelId } = ctx.state.panel;
    return `${accountType}/${ownerId}/panels/${panelId}/widgets`;
  }

  private getContext(): GlobalContextValue {
    const ctx = this.getCurrentContext();
    if (!ctx) throw new Error("GlobalContext no disponible");
    return ctx;
  }

  private collectionRef() {
    return collection(this.firestore, this.getCollectionPath()).withConverter(
      widgetConverter,
    );
  }

  private docRef(id: string) {
    return doc(this.firestore, this.getCollectionPath(), id).withConverter(
      widgetConverter,
    );
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
    return onSnapshot(
      query(this.collectionRef()),
      (snap) => onData(snap.docs.map((d) => d.data())),
      (error) => onError(error.message),
    );
  }

  // -------------------------------------------------------
  // 📌 QUERIES PUNTUALES
  // -------------------------------------------------------

  async findByPanel(_panelId: string): Promise<Widget[]> {
    const snap = await getDocs(query(this.collectionRef()));
    return snap.docs.map((d) => d.data());
  }

  async findById(id: string, _panelId?: string): Promise<Widget | null> {
    const snap = await getDoc(this.docRef(id));
    return snap.exists() ? snap.data() : null;
  }

  async findByRef(documentRef: DocumentReference): Promise<Widget | null> {
    const snap = await getDoc(documentRef.withConverter(widgetConverter));
    if (!snap.exists()) throw new Error("Widget no encontrado");
    return snap.data();
  }

  // -------------------------------------------------------
  // ➕ CREATE
  // -------------------------------------------------------

  async create(data: CreateWidgetDTO): Promise<Widget> {
    const now = Timestamp.now();
    const payload = { ...data, createdAt: now, updatedAt: now } as Widget;

    const ref = await addDoc(this.collectionRef(), payload);
    return { ...payload, id: ref.id };
  }

  // -------------------------------------------------------
  // 🔧 UPDATE
  // -------------------------------------------------------

  async update(id: string, data: UpdateWidgetDTO): Promise<Widget> {
    const now = Timestamp.now();
    const updateData = withoutId({ ...data, updatedAt: now });

    await updateDoc(this.docRef(id), updateData);

    // Sin round-trip extra: el caller ya tiene el widget completo antes
    // de llamar a update(); acá solo devolvemos lo que cambió + id.
    return { id, ...updateData } as Widget;
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
      batch.update(this.docRef(id), { layout, updatedAt: now });
    }

    await batch.commit();
  }

  // -------------------------------------------------------
  // 🗑️ DELETE
  // -------------------------------------------------------

  async delete(id: string): Promise<void> {
    await deleteDoc(this.docRef(id));
  }
}
