import {
  collection,
  doc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  Timestamp,
  DocumentReference,
  Firestore,
  writeBatch,
  where,
  collectionGroup,
  onSnapshot,
  documentId,
  type Unsubscribe,
  addDoc,
  deleteField,
} from "firebase/firestore";
import type { PanelRepository } from "../app/panelsRepository.interface";
import type {
  CreatePanelDTO,
  Panel,
  UpdatePanelDTO,
} from "../domain/panel.entity";
import type { User } from "#core/auth/domain/user.entity";
import {
  err,
  ok,
  type ResultApp,
  type AppErr,
  firebaseErr,
} from "#core/appCore/domain/AppCore.type";
import { withoutId } from "#core/appCore/infraestructure/firebase/withoutId";
import { panelConverter } from "./panel.converter";

export class FirebasePanelsRepository implements PanelRepository {
  constructor(
    private firestore: Firestore,
    private getCurrentUser: () => User,
  ) {}

  // ─── Helpers ─────────────────────────────────────────────────────────────

  private getCollectionPath(): string {
    const { accountType, id } = this.getUser();
    return `${accountType}/${id}/panels`;
  }

  private getUser(): User {
    const ctx = this.getCurrentUser();
    if (!ctx) throw new Error("panelUserContext no disponible");
    return ctx;
  }

  private collectionRef() {
    return collection(this.firestore, this.getCollectionPath()).withConverter(
      panelConverter,
    );
  }

  private docRef(id: string) {
    return doc(this.firestore, this.getCollectionPath(), id).withConverter(
      panelConverter,
    );
  }

  private setPanelDefault(): CreatePanelDTO {
    const now = Timestamp.now();
    return {
      parentId: null,
      name: "",
      color: -1,
      icon: "",
      sharedWith: null,
      createdAt: now,
      updatedAt: now,
    };
  }

  // ─── Suscripciones en tiempo real ────────────────────────────────────────

  /**
   * Escucha el panel "home" en tiempo real.
   * Si no existe aún, lo crea y el listener se dispara automáticamente
   * con el nuevo documento.
   */
  subscribeToHomePanel(
    onData: (panel: Panel) => void,
    onError: (err: AppErr) => void,
  ): Unsubscribe {
    const q = query(
      this.collectionRef(),
      where("color", "==", -1),
      where("parentId", "==", null),
    );

    // Bandera para evitar creaciones paralelas si el listener dispara varias veces
    let creating = false;

    return onSnapshot(
      q,
      (snap) => {
        if (!snap.empty) {
          creating = false;
          onData(snap.docs[0].data());
          return;
        }

        // Panel no existe — crear por primera vez (solo una vez)
        if (!creating) {
          creating = true;
          this.create(this.setPanelDefault()).then((result) => {
            if (!result.success) {
              creating = false;
              onError(result.err);
            }
            // Si tuvo éxito, el onSnapshot se dispara de nuevo con el nuevo doc
          });
        }
      },
      (error) => onError(firebaseErr(error.message, error.code, error.stack)),
    );
  }

  /**
   * Escucha todos los paneles del usuario en tiempo real.
   */
  subscribeToAll(
    onData: (panels: Panel[]) => void,
    onError: (err: AppErr) => void,
  ): Unsubscribe {
    return onSnapshot(
      query(this.collectionRef()),
      (snap) => onData(snap.docs.map((d) => d.data())),
      (error) => onError(firebaseErr(error.message)),
    );
  }

  // ─── Queries puntuales ────────────────────────────────────────────────────

  async findHomePanel(): Promise<ResultApp<Panel, AppErr>> {
    const q = query(
      this.collectionRef(),
      where("color", "==", -1),
      where("icon", "==", ""),
      where("name", "==", ""),
      where("sharedWith", "==", null),
    );

    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return this.create(this.setPanelDefault());
    }
    return ok(querySnapshot.docs[0].data());
  }

  async findAll(): Promise<ResultApp<Panel[], AppErr>> {
    const querySnapshot = await getDocs(query(this.collectionRef()));
    return ok(querySnapshot.docs.map((d) => d.data()));
  }

  async findByParentId(
    parentId: DocumentReference,
  ): Promise<ResultApp<Panel[], AppErr>> {
    const q = query(this.collectionRef(), where("parentId", "==", parentId));
    const querySnapshot = await getDocs(q);
    return ok(querySnapshot.docs.map((d) => d.data()));
  }

  async findById(id: string): Promise<ResultApp<Panel | undefined, AppErr>> {
    const docSnap = await getDoc(this.docRef(id));
    return ok(docSnap.exists() ? docSnap.data() : undefined);
  }

  /**
   * Trae varios paneles por id en el menor número de queries posible, en
   * vez de un `findById` por cada uno. Firestore limita el operador `in` a
   * 10 valores por query, así que agrupamos en chunks de a 10 y los
   * disparamos todos en paralelo.
   */
  async findManyByIds(ids: string[]): Promise<ResultApp<Panel[], AppErr>> {
    const uniqueIds = Array.from(new Set(ids));
    if (uniqueIds.length === 0) return ok([]);

    const FIRESTORE_IN_LIMIT = 10;
    const chunks: string[][] = [];
    for (let i = 0; i < uniqueIds.length; i += FIRESTORE_IN_LIMIT) {
      chunks.push(uniqueIds.slice(i, i + FIRESTORE_IN_LIMIT));
    }

    try {
      const snapshots = await Promise.all(
        chunks.map((chunk) =>
          getDocs(query(this.collectionRef(), where(documentId(), "in", chunk))),
        ),
      );

      const panels = snapshots.flatMap((snap) => snap.docs.map((d) => d.data()));
      return ok(panels);
    } catch (error) {
      return err(
        firebaseErr(
          error instanceof Error
            ? error.message
            : "Error al leer paneles por id",
          undefined,
          error instanceof Error ? error.stack : undefined,
        ),
      );
    }
  }

  async findByRef(
    ref: DocumentReference,
  ): Promise<ResultApp<Panel | undefined, AppErr>> {
    const docSnap = await getDoc(ref.withConverter(panelConverter));
    if (docSnap.exists()) return ok(docSnap.data());
    return err(firebaseErr("Panel no encontrado"));
  }

  async findDocRef(id: string): Promise<ResultApp<DocumentReference, AppErr>> {
    try {
      return ok(doc(this.firestore, this.getCollectionPath(), id));
    } catch {
      return err(firebaseErr("No se pudo generar la referencia del documento"));
    }
  }

  async findBySharedId(
    sharedId: DocumentReference,
  ): Promise<ResultApp<Panel | undefined, AppErr>> {
    const q = query(
      collectionGroup(this.firestore, "panels").withConverter(panelConverter),
      where("sharedWith", "==", sharedId.id),
    );
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return ok(undefined);
    return ok(querySnapshot.docs[0].data());
  }

  async findArchived(
    parentId: DocumentReference | null,
  ): Promise<ResultApp<Panel[] | undefined, AppErr>> {
    const q = query(
      this.collectionRef(),
      where("isArchived", "==", true),
      where("parentId", "==", parentId),
    );
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return ok(undefined);
    return ok(querySnapshot.docs.map((d) => d.data()));
  }

  // ─── Mutaciones — sin getDoc extra post-escritura ─────────────────────────

  async create(
    data: CreatePanelDTO,
    parentId?: DocumentReference,
  ): Promise<ResultApp<Panel, AppErr>> {
    const { accountType, id: ownerId } = this.getUser();
    const now = Timestamp.now();

    const panelData = {
      ...data,
      parentId: parentId ?? null,
      createdAt: data.createdAt ?? now,
      updatedAt: data.updatedAt ?? now,
    } as Panel;

    const docRef = await addDoc(this.collectionRef(), panelData);

    // Construimos el panel localmente para evitar el getDoc extra.
    return ok({ ...panelData, id: docRef.id, ownerId, ownerAccountType: accountType });
  }

  async addSubPanel(
    parentRef: DocumentReference,
    _childRef: DocumentReference,
  ): Promise<ResultApp<void, AppErr>> {
    try {
      await updateDoc(parentRef, { updatedAt: Timestamp.now() });
      return ok(undefined);
    } catch {
      return err(firebaseErr("Error al actualizar el panel padre"));
    }
  }

  async archive(id: string): Promise<ResultApp<void, AppErr>> {
    const updateData = { isArchived: true, updatedAt: Timestamp.now() };
    return updateDoc(this.docRef(id), updateData)
      .then(() => ok(undefined))
      .catch((error) =>
        err(
          firebaseErr(
            error instanceof Error
              ? error.message
              : "Error al archivar el panel",
            undefined,
            error instanceof Error ? error.stack : undefined,
          ),
        ),
      );
  }

  async unarchive(id: string): Promise<ResultApp<void, AppErr>> {
    const updateData = { isArchived: deleteField(), updatedAt: Timestamp.now() };
    return updateDoc(this.docRef(id), updateData)
      .then(() => ok(undefined))
      .catch((error) =>
        err(
          firebaseErr(
            error instanceof Error
              ? error.message
              : "Error al desarchivar el panel",
            undefined,
            error instanceof Error ? error.stack : undefined,
          ),
        ),
      );
  }

  async update(
    id: string,
    data: UpdatePanelDTO,
  ): Promise<ResultApp<Panel, AppErr>> {
    const { accountType, id: ownerId } = this.getUser();
    const now = Timestamp.now();
    const updateData = withoutId({ ...data, updatedAt: now });

    await updateDoc(this.docRef(id), updateData);

    // Sin getDoc extra: reconstruimos localmente con lo que acabamos de escribir.
    return ok({ id, ownerId, ownerAccountType: accountType, ...updateData } as Panel);
  }

  async delete(id: string): Promise<ResultApp<void, AppErr>> {
    await deleteDoc(this.docRef(id));
    return ok(undefined);
  }

  /**
   * BFS contra Firestore (no contra la caché local) para encontrar TODOS los
   * descendientes de `rootId`, a cualquier profundidad. Ir directo a la
   * fuente acá es intencional: la caché puede no tener cargada una rama
   * entera del árbol que igual hay que borrar.
   */
  private async collectDescendantIds(rootId: string): Promise<string[]> {
    const descendantIds: string[] = [];
    const queue: string[] = [rootId];

    while (queue.length > 0) {
      const currentId = queue.shift() as string;
      const parentRef = doc(this.firestore, this.getCollectionPath(), currentId);
      const childrenQuery = query(
        this.collectionRef(),
        where("parentId", "==", parentRef),
      );
      const snap = await getDocs(childrenQuery);

      for (const childDoc of snap.docs) {
        descendantIds.push(childDoc.id);
        queue.push(childDoc.id);
      }
    }

    return descendantIds;
  }

  async deleteCascade(
    id: string,
  ): Promise<ResultApp<{ deletedIds: string[] }, AppErr>> {
    const FIRESTORE_BATCH_LIMIT = 500;

    try {
      const descendantIds = await this.collectDescendantIds(id);
      const deletedIds = [id, ...descendantIds];

      // Firestore permite un máximo de 500 operaciones por batch — si el
      // subárbol es más grande, lo segmentamos en varios batches. Cada
      // batch sigue siendo atómico en sí mismo; entre batches no hay
      // rollback cruzado, que es la mejor garantía disponible arriba del
      // límite duro de la API.
      for (let i = 0; i < deletedIds.length; i += FIRESTORE_BATCH_LIMIT) {
        const chunk = deletedIds.slice(i, i + FIRESTORE_BATCH_LIMIT);
        const batch = writeBatch(this.firestore);
        for (const panelId of chunk) {
          batch.delete(doc(this.firestore, this.getCollectionPath(), panelId));
        }
        await batch.commit();
      }

      return ok({ deletedIds });
    } catch (error) {
      return err(
        firebaseErr(
          error instanceof Error
            ? error.message
            : "Error al eliminar el panel y sus descendientes",
          undefined,
          error instanceof Error ? error.stack : undefined,
        ),
      );
    }
  }

  async deleteArchived(
    ref: DocumentReference,
  ): Promise<ResultApp<void, AppErr>> {
    try {
      await deleteDoc(ref);
      return ok(undefined);
    } catch (error) {
      return err(
        firebaseErr(
          error instanceof Error
            ? error.message
            : "Error al eliminar el panel archivado",
          undefined,
          error instanceof Error ? error.stack : undefined,
        ),
      );
    }
  }
}
